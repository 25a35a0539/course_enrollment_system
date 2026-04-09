from flask import Blueprint, request, jsonify
from extensions import db 
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Course, Enrollment, InstructorProfile, Rating
from models import Course, Lesson, Quiz, Question, Option, InstructorProfile, Enrollment, User, Rating
from flask_cors import CORS

instructor_bp = Blueprint('instructor', __name__)
CORS(instructor_bp)


@instructor_bp.route('/dashboard-data', methods=['GET','OPTIONS'])
@jwt_required()
def get_instructor_dashboard():
    if request.method == 'OPTIONS' :
        return jsonify({"status": "ok"}), 200
    user_id = get_jwt_identity()

    # 1. Fetch Profile & Basic Stats
    profile = InstructorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Instructor profile not found. Please log in again."}), 401

    # 2. Get Courses given by him
    my_courses = Course.query.filter_by(instructor_id=user_id).all()
    course_ids = [c.course_id for c in my_courses]

    # 3. Aggregate Enrollments
    # Total unique students enrolled in all his courses
    # total_enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).count()
    total_unique_students = db.session.query(Enrollment.student_id)\
        .filter(Enrollment.course_id.in_(course_ids))\
        .distinct().count()
    
    # List of students enrolled (Detailed list)
    enrolled_students = db.session.query(
        User.name, User.email, Course.title, Enrollment.enrollment_date
    ).join(Enrollment, User.user_id == Enrollment.student_id)\
     .join(Course, Enrollment.course_id == Course.course_id)\
     .filter(Course.instructor_id == user_id).all()

    # 4. Fetch Reviews for his courses
    reviews = db.session.query(
        Rating.rating, Rating.comments, Course.title, User.name
    ).join(Course, Rating.course_id == Course.course_id)\
     .join(User, Rating.student_id == User.user_id)\
     .filter(Course.instructor_id == user_id).all()

    return jsonify({
        "stats": {
            "name": User.query.get(user_id).name,
            "credits": profile.credits,
            "total_courses": len(my_courses),
            "total_students": total_unique_students,
            "rating": profile.rating
        },
        "courses": [{
            "id": c.course_id,
            "title": c.title,
            "category": c.category,
            "status": c.status,
            "created_at": c.created_at.strftime("%Y-%m-%d")
        } for c in my_courses],
        "students": [{
            "name": s.name,
            "email": s.email,
            "course": s.title,
            "date": s.enrollment_date.strftime("%Y-%m-%d")
        } for s in enrolled_students],
        "reviews": [{
            "student": r.name,
            "course": r.title,
            "rating": r.rating,
            "comment": r.comments
        } for r in reviews]
    }), 200


# # 🟢 CREATE FULL COURSE (With Lesson Duration Fix)
# from flask import request, jsonify
# from app import db

@instructor_bp.route('/create-course', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_course():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    user_id = get_jwt_identity() # 🚩 JWT nundi instructor ID teesko
    data = request.get_json()
    
    try:
        # 1. Course Metadata
        new_course = Course(
            title=data.get('title'),
            description=data.get('description'),
            instructor_id=user_id, # 🚩 Model lo idi undi, so kachitanga pampali
            category=data.get('category'),
            duration=data.get('duration'),
            difficulty_level=data.get('difficulty_level')
        )
        db.session.add(new_course)
        db.session.flush()

        # 2. Lessons Logic
        for idx, l_data in enumerate(data.get('lessons', [])):
            lesson = Lesson(
                course_id=new_course.course_id,
                title=l_data.get('title'),
                url=l_data.get('url'), # 🚩 Model lo 'url' ani undi kabatti
                duration=l_data.get('duration'),
                order_no=idx + 1 # 🚩 Model lo idi null kaadu, so pampali
            )
            db.session.add(lesson)

        # 3. Quizzes Logic
        for qz_data in data.get('quizzes', []):
            quiz = Quiz(
                course_id=new_course.course_id,
                total_marks=qz_data.get('total_marks', 100), # 🚩 Model prakaram
                passing_marks=qz_data.get('passing_marks', 35)
            )
            db.session.add(quiz)
            db.session.flush()

            # 4. Questions
            for qst_data in qz_data.get('questions', []):
                question = Question(
                    quiz_id=quiz.quiz_id,
                    question_text=qst_data.get('text')
                )
                db.session.add(question)
                db.session.flush()

                # 5. Options
                for opt_data in qst_data.get('options', []):
                    option = Option(
                        question_id=question.question_id,
                        option_text=opt_data.get('text'),
                        is_correct=opt_data.get('is_correct', False)
                    )
                    db.session.add(option)

        db.session.commit()
        return jsonify({"message": "Course created successfully! 🔥"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Brutal DB Error: {str(e)}") # 🚩 Terminal lo error chudu ippudu
        return jsonify({"error": str(e)}), 400

@instructor_bp.route('/profile-details', methods=['GET'])
@jwt_required()
def get_profile_details():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    profile = InstructorProfile.query.filter_by(user_id=user_id).first()

    if not user or not profile:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "bio": profile.bio or "",
        "expertise": profile.expertise or "",
        "experience": profile.experience_years or 0,
        "credits": profile.credits or 0
        # "admin_remarks": ... ee line ni teeseyi
    }),  200

# 🟢 UPDATE PROFILE
@instructor_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    user = User.query.get(user_id)
    profile = InstructorProfile.query.filter_by(user_id=user_id).first()
    
    if not profile: return jsonify({"error": "Profile not found"}), 404
    
    # Update User Table
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    
    # Update Profile Table
    profile.bio = data.get('bio', profile.bio)
    profile.expertise = data.get('expertise', profile.expertise)
    profile.experience_years = data.get('experience', profile.experience_years)
    
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200







@instructor_bp.route('/course-details/<int:course_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_course_details(course_id):
    # 🚩 Preflight check handling
    if request.method == 'OPTIONS' or request.method == 'HEAD':
        return jsonify({"status": "ok"}), 200

    user_id = get_jwt_identity()
    # Check if course exists and belongs to this instructor
    course = Course.query.filter_by(course_id=course_id, instructor_id=user_id).first()
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    
    if not course:
        return jsonify({"error": "Course not found"}), 404

    quiz_list = []
    for q in quizzes:
        questions = Question.query.filter_by(quiz_id=q.quiz_id).all()
        q_data = {
            "quiz_title": f"Quiz {q.quiz_id}", # Or add a title column to Quiz model
            "passing_marks": q.passing_marks,
            "questions": []
        }
        for qst in questions:
            opts = Option.query.filter_by(question_id=qst.question_id).all()
            q_data["questions"].append({
                "text": qst.question_text,
                "options": [{"text": o.option_text, "is_correct": o.is_correct} for o in opts]
            })
        quiz_list.append(q_data)

    # Lessons, Quizzes, etc. ni return cheyyali
    return jsonify({
        "course_id": course.course_id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "duration": course.duration,
        "difficulty_level": course.difficulty_level,
        "lessons": [{
            "title": l.title,
            "url": l.url,
            "duration": l.duration
        } for l in Lesson.query.filter_by(course_id=course_id).all()],
        # Quizzes logic kooda ikkade add chey...
        "quizzes": quiz_list,
    }), 200

from models import LessonProgress, QuizResult # Make sure these are imported at the top of your file!

@instructor_bp.route('/update-course/<int:course_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_course(course_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    data = request.get_json()
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404

    try:
        # 1. Update Core Metadata
        course.title = data.get('title', course.title)
        course.description = data.get('description', course.description)
        course.category = data.get('category', course.category)
        course.duration = data.get('duration', course.duration)
        course.difficulty_level = data.get('difficulty_level', course.difficulty_level)

        # 2. Sync Lessons (Fixing the Foreign Key Error)
        old_lessons = Lesson.query.filter_by(course_id=course_id).all()
        old_lesson_ids = [l.lesson_id for l in old_lessons]
        
        if old_lesson_ids:
            # 🚩 FIX: Delete the students' progress records tied to these old lessons FIRST
            LessonProgress.query.filter(LessonProgress.lesson_id.in_(old_lesson_ids)).delete(synchronize_session=False)
            
        # Now it is safe to delete the lessons
        Lesson.query.filter_by(course_id=course_id).delete(synchronize_session=False)
        
        for idx, l_data in enumerate(data.get('lessons', [])):
            new_lesson = Lesson(
                course_id=course_id,
                title=l_data['title'],
                url=l_data['url'],
                duration=l_data['duration'],
                order_no=idx + 1  # Keeping order intact
            )
            db.session.add(new_lesson)

        # 3. Sync Quizzes (Fixing the impending QuizResult Foreign Key Error)
        quizzes = Quiz.query.filter_by(course_id=course_id).all()
        quiz_ids = [q.quiz_id for q in quizzes]

        if quiz_ids:
            # 🚩 FIX: Delete the students' quiz results tied to these old quizzes FIRST
            QuizResult.query.filter(QuizResult.quiz_id.in_(quiz_ids)).delete(synchronize_session=False)

            # A. Delete Options linked to these quizzes' questions
            questions = Question.query.filter(Question.quiz_id.in_(quiz_ids)).all()
            question_ids = [qst.question_id for qst in questions]
            
            if question_ids:
                Option.query.filter(Option.question_id.in_(question_ids)).delete(synchronize_session=False)
            
            # B. Delete Questions linked to these quizzes
            Question.query.filter(Question.quiz_id.in_(quiz_ids)).delete(synchronize_session=False)
            
            # C. Finally, delete the Quizzes
            Quiz.query.filter(Quiz.quiz_id.in_(quiz_ids)).delete(synchronize_session=False)

        # 4. Add New Quiz Data from Frontend
        for q_data in data.get('quizzes', []):
            new_quiz = Quiz(
                course_id=course_id,
                total_marks=len(q_data.get('questions', [])), 
                passing_marks=q_data.get('passing_marks', 1)
            )
            db.session.add(new_quiz)
            db.session.flush() 

            for qst_data in q_data.get('questions', []):
                new_qst = Question(
                    quiz_id=new_quiz.quiz_id,
                    question_text=qst_data['text']
                )
                db.session.add(new_qst)
                db.session.flush()

                for opt_data in qst_data.get('options', []):
                    new_opt = Option(
                        question_id=new_qst.question_id,
                        option_text=opt_data['text'],
                        is_correct=opt_data['is_correct']
                    )
                    db.session.add(new_opt)

        db.session.commit()
        return jsonify({"message": "Course and Quizzes updated successfully! 🔥"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500