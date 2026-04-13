from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import (
    User, StudentProfile, Badge, StudentBadge, Certificate, InstructorProfile, Course, Enrollment, Lesson, LessonProgress, Interest, StudentInterest, Quiz, Question, Option, QuizResult, Rating
)
from datetime import date, timedelta

student_bp = Blueprint('student', __name__)

# --- HELPER: STREAK & BADGE CHECK ---
# 🚩 backend/routes/student.py (Line 15-30 area)

def update_student_gamification(user_id):
    profile = StudentProfile.query.get(user_id)
    if not profile:
        return

    # Safe checking for None values 🛡️
    curr = profile.current_streak if profile.current_streak is not None else 0
    longest = profile.longest_streak if profile.longest_streak is not None else 0
    
    today = date.today()
    yesterday = today - timedelta(days=1)
 
    # 1. Update Streak Logic
    if profile.last_login_date == yesterday:
        curr += 1
    elif profile.last_login_date != today:
        curr = 1 
    
    # Update back to profile
    profile.current_streak = curr
    
    # 🚩 Comparison Fix:
    if curr > longest:
        profile.longest_streak = curr
    else:
        profile.longest_streak = longest
    
    profile.last_login_date = today
    db.session.commit()

   

# --- 2. UPDATE INTERESTS (Popup Logic) ---
@student_bp.route('/update-interests', methods=['POST'])
@jwt_required()
def update_interests():
    user_id = get_jwt_identity()
    data = request.get_json() # Expecting list of interest IDs: [1, 5, 8]
    
    # Clear old interests
    StudentInterest.query.filter_by(student_id=user_id).delete()
    
    for int_id in data.get('interests', []):
        new_int = StudentInterest(student_id=user_id, interest_id=int_id)
        db.session.add(new_int)
    
    db.session.commit()
    return jsonify({"message": "Interests updated successfully!"}), 200

# --- 3. LESSON PROGRESS & AUTO-BADGE ---
@student_bp.route('/complete-lesson', methods=['POST'])
@jwt_required()
def complete_lesson():
    user_id = get_jwt_identity()
    data = request.get_json()
    lesson_id = data.get('lesson_id')
    course_id = data.get('course_id')

    # Mark Lesson Complete
    progress = LessonProgress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not progress:
        progress = LessonProgress(user_id=user_id, lesson_id=lesson_id, is_completed=True)
        db.session.add(progress)
    
    # Recalculate Course Progress
    total_lessons = db.session.query(db.func.count(Lesson.lesson_id)).filter_by(course_id=course_id).scalar()
    done_lessons = db.session.query(db.func.count(LessonProgress.lesson_id)).join(
        Lesson, Lesson.lesson_id == LessonProgress.lesson_id
    ).filter(LessonProgress.user_id == user_id, Lesson.course_id == course_id).scalar()

    new_percent = (done_lessons / total_lessons) * 100
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    enrollment.progress = new_percent

    # Check for "Course Complete" Badge
    if new_percent == 100:
        course_badge = Badge.query.filter_by(badge_type='COURSE_COUNT', threshold=1).first() # First Course Badge
        # Logic to assign badge if not exists...
        # Trigger Email/Certificate logic here

    db.session.commit()
    return jsonify({"progress": new_percent}), 200

@student_bp.route('/interests', methods=['GET'])
@jwt_required()
def get_all_interests():
    # Interests table nundi anni fetch chesi list la pampali
    interests = Interest.query.all()
    return jsonify([
        {"interest_id": i.interest_id, "interest_name": i.interest_name} 
        for i in interests
    ]), 200

# 🚩 backend/routes/student.py

@student_bp.route('/enroll', methods=['POST', 'OPTIONS'])
@jwt_required()
def enroll_course():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    user_id = get_jwt_identity()
    data = request.get_json()
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"error": "Course ID is required"}), 400

    # 1. Check if already enrolled 🛡️
    existing = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if existing:
        return jsonify({"message": "You are already enrolled in this course!"}), 400

    # 2. Create Enrollment Entry
    new_enrollment = Enrollment(
        student_id=user_id,
        course_id=course_id,
        status="ACTIVE",
        progress=0
    )
    db.session.add(new_enrollment)

    # 3. Update Student Profile Count
    profile = StudentProfile.query.get(user_id)
    if profile:
        profile.enrolled_course_count = (profile.enrolled_course_count or 0) + 1
    
    db.session.commit()
    return jsonify({"message": "Successfully enrolled! Happy learning! 🚀"}), 200



# 🚩 ADD THIS HELPER TO student.py
def check_and_award_badges(user_id):
    profile = StudentProfile.query.get(user_id)
    if not profile: return

    # Badges we want to check (thresholds)
    # Ensure these exist in your DB or pre-seed them!
    
    # 1. Streak Badges
    streak = profile.longest_streak or 0
    if streak >= 3: award_badge(user_id, 'STREAK', 3, "3-Day Fire", "🔥")
    if streak >= 7: award_badge(user_id, 'STREAK', 7, "7-Day Scholar", "⚡")

    # 2. Course Count Badges
    courses_done = Enrollment.query.filter_by(student_id=user_id, progress=100).count()
    if courses_done >= 1: award_badge(user_id, 'COURSE_COUNT', 1, "First Blood", "🎯")
    if courses_done >= 5: award_badge(user_id, 'COURSE_COUNT', 5, "Knowledge Junkie", "🧠")

def award_badge(user_id, b_type, threshold, title, icon):
    # Find or create badge
    badge = Badge.query.filter_by(badge_type=b_type, threshold=threshold).first()
    if not badge:
        badge = Badge(title=title, badge_type=b_type, threshold=threshold, image_url=icon)
        db.session.add(badge)
        db.session.flush()
        
    # Check if student already has it
    has_badge = StudentBadge.query.filter_by(student_id=user_id, badge_id=badge.badge_id).first()
    if not has_badge:
        db.session.add(StudentBadge(student_id=user_id, badge_id=badge.badge_id))
        db.session.commit()



    user_id = get_jwt_identity()
    data = request.get_json()
    course_id = data.get('course_id')
    answers = data.get('answers', {})
    
    quiz = Quiz.query.filter_by(course_id=course_id).first()
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    score = 0
    total = len(answers)
    for q_id, opt_id in answers.items():
        correct_option = Option.query.filter_by(question_id=q_id, is_correct=True).first()
        if correct_option and correct_option.option_id == int(opt_id):
            score += 1

    percentage = (score / total) * 100 if total > 0 else 0
    is_passed = percentage >= 60

    # 🚩 CRITICAL FIX: Actually save the result to the database!
    result_entry = QuizResult.query.filter_by(student_id=user_id, quiz_id=quiz.quiz_id).first()
    if result_entry:
        result_entry.score = score
        result_entry.is_passed = is_passed
    else:
        new_result = QuizResult(student_id=user_id, quiz_id=quiz.quiz_id, score=score, is_passed=is_passed)
        db.session.add(new_result)
        
    db.session.commit()

    return jsonify({
        "score": score, "total": total, 
        "percentage": percentage, "passed": is_passed
    }), 200

@student_bp.route('/quiz-results', methods=['GET'])
@jwt_required()
def get_quiz_results():
    user_id = get_jwt_identity()
    
    # Join QuizResult -> Quiz -> Course to get titles
    results = db.session.query(QuizResult, Quiz, Course).join(
        Quiz, QuizResult.quiz_id == Quiz.quiz_id
    ).join(
        Course, Quiz.course_id == Course.course_id
    ).filter(QuizResult.student_id == user_id).all()
    
    output = []
    for r, q, c in results:
        output.append({
            "course_title": c.title,
            "score": r.score,
            "total_marks": q.total_marks,
            "percentage": (r.score / q.total_marks * 100) if q.total_marks > 0 else 0,
            "is_passed": r.is_passed
        })
    return jsonify(output), 200


# ---------------------------------------------------------
@student_bp.route('/get-quiz/<int:course_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_quiz(course_id):
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    # 1. Fetch all quizzes for this course
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    quiz_ids = [q.quiz_id for q in quizzes]

    # 2. Fetch questions only if quizzes exist (Solves the InvalidRequestError)
    questions = Question.query.filter(Question.quiz_id.in_(quiz_ids)).all() if quiz_ids else []
    
    quiz_data = []
    for q in questions:
        options = Option.query.filter_by(question_id=q.question_id).all()
        quiz_data.append({
            "id": q.question_id,
            "text": q.question_text,
            "options": [{"id": o.option_id, "text": o.option_text} for o in options]
        })
    
    return jsonify(quiz_data), 200

@student_bp.route('/submit-quiz', methods=['POST'])
@jwt_required()
def submit_quiz():
    user_id = get_jwt_identity()
    data = request.get_json()
    course_id = data.get('course_id')
    answers = data.get('answers', {})
    
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    if not quizzes:
        return jsonify({"error": "No quizzes found"}), 404

    score = 0
    total = len(answers)
    for q_id, opt_id in answers.items():
        correct_option = Option.query.filter_by(question_id=q_id, is_correct=True).first()
        if correct_option and correct_option.option_id == int(opt_id):
            score += 1

    percentage = (score / total) * 100 if total > 0 else 0
    is_passed = percentage >= 60 # Master pass threshold

    # Save result for ALL quizzes in this master assessment
    for quiz in quizzes:
        result_entry = QuizResult.query.filter_by(student_id=user_id, quiz_id=quiz.quiz_id).first()
        if result_entry:
            result_entry.score = score
            result_entry.is_passed = is_passed
        else:
            new_result = QuizResult(student_id=user_id, quiz_id=quiz.quiz_id, score=score, is_passed=is_passed)
            db.session.add(new_result)
            
    db.session.commit()
   
        
        # 🚩 CALL THIS AFTER SAVING QUIZ RESULT
    check_and_award_badges(user_id) 

      

    return jsonify({
        "score": score, "total": total, 
        "percentage": percentage, "passed": is_passed
    }), 200


@student_bp.route('/course-content/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_content(course_id):
    user_id = get_jwt_identity()
    
    course_lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_no).all()
    total_lessons = len(course_lessons)

    lessons_data = []
    completed_lessons_count = 0
    
    for l in course_lessons:
        is_comp = LessonProgress.query.filter_by(user_id=user_id, lesson_id=l.lesson_id, is_completed=True).first() is not None
        if is_comp:
            completed_lessons_count += 1
            
        lessons_data.append({
            "lesson_id": l.lesson_id,
            "title": l.title,
            "url": l.url,
            "duration": l.duration,
            "is_completed": is_comp
        })

    # Check Quizzes
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    total_quizzes = len(quizzes)
    passed_quizzes = sum(1 for q in quizzes if QuizResult.query.filter_by(student_id=user_id, quiz_id=q.quiz_id, is_passed=True).first())

    # The 95% Capping Logic
    if total_lessons == 0:
        current_progress = 0
    else:
        lesson_fraction = completed_lessons_count / total_lessons
        
        if total_quizzes > 0:
            # Lessons represent 95% of the course, Quiz represents the last 5%
            quiz_fraction = passed_quizzes / total_quizzes
            current_progress = int((lesson_fraction * 95) + (quiz_fraction * 5))
        else:
            # If no quizzes exist, lessons represent 100%
            current_progress = int(lesson_fraction * 100)

    # Sync this true progress back to the Enrollment table so the Dashboard matches!
    enrollment = Enrollment.query.filter_by(student_id=user_id, course_id=course_id).first()
    if enrollment:
        enrollment.progress = current_progress
        db.session.commit()
    
    return jsonify({
        "course_id": course_id,
        "lessons": lessons_data, 
        "current_progress": current_progress,
        "has_quiz": total_quizzes > 0,
        "all_quizzes_passed": passed_quizzes == total_quizzes if total_quizzes > 0 else True
    }), 200




from sqlalchemy import func # Ensure this is imported at the top!

@student_bp.route('/reviews', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def handle_reviews():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    user_id = get_jwt_identity()

    if request.method == 'POST':
        data = request.json
        course_id = data['course_id']
        
        # 1. Add or Update the Student's Review
        existing = Rating.query.filter_by(student_id=user_id, course_id=course_id).first()
        
        if existing:
            existing.rating = data['rating']
            existing.comments = data['comments']
        else:
            new_review = Rating(
                student_id=user_id,
                course_id=course_id,
                rating=data['rating'],
                comments=data['comments']
            )
            db.session.add(new_review)
        
        db.session.commit() # Save the review first

        # ---------------------------------------------------------
        # 🚩 FIX: RECALCULATE THE AVERAGE COURSE RATING
        # ---------------------------------------------------------
        # Get the average of all ratings for this specific course
        avg_rating = db.session.query(func.avg(Rating.rating)).filter(Rating.course_id == course_id).scalar()
        
        if avg_rating is not None:
            course = Course.query.get(course_id)
            if course:
                # Round to 1 decimal place (e.g., 4.6)
                course.rating = round(float(avg_rating), 1) 
                
                # Bonus 🚀: Update Instructor's Overall Rating too!
                instructor_profile = InstructorProfile.query.filter_by(user_id=course.instructor_id).first()
                if instructor_profile:
                    # Calculate average of all courses taught by this instructor
                    instr_avg = db.session.query(func.avg(Course.rating)).filter(Course.instructor_id == course.instructor_id).scalar()
                    instructor_profile.rating = round(float(instr_avg), 1) if instr_avg else 0.0

                db.session.commit() # Save the updated averages
        # ---------------------------------------------------------

        return jsonify({"message": "Review submitted successfully!"}), 201

    # ... (Keep your existing GET logic down here) ...
    enrolled = db.session.query(Course, Rating).join(
        Enrollment, Course.course_id == Enrollment.course_id
    ).outerjoin(
        Rating, (Course.course_id == Rating.course_id) & (Rating.student_id == user_id)
    ).filter(Enrollment.student_id == user_id).all()

    reviews_data = []
    for course, rating in enrolled:
        reviews_data.append({
            "course_id": course.course_id,
            "title": course.title,
            "rating": rating.rating if rating else 0,
            "comments": rating.comments if rating else ""
        })

    return jsonify(reviews_data), 200




from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import (User, StudentProfile, Badge, StudentBadge, Course, Enrollment, Interest, StudentInterest)
from datetime import date, timedelta
import random


# --- Helper: Greeting Generator ---
# 🚩 REPLACE get_dashboard_main AND ADD get_all_badges IN student.py

# Helper: Just the tricky question now
def get_tricky_question():
    questions = [
        "Ready to break some code (and not production)?",
        "Coffee loaded? Brain compiled? Let's go!",
        "Escaping infinite loops in life and code today?",
        "404: Excuses Not Found. Time to learn!"
    ]
    return random.choice(questions)


# 1. PROFILE UPDATE ROUTE FIX
@student_bp.route('/profile/update', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_profile():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    data = request.json
    user_id = get_jwt_identity()
    
    profile = StudentProfile.query.get(user_id)
    user = User.query.get(user_id)

    if not profile or not user:
        return jsonify({"error": "User not found"}), 404

    # Update User Table
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    
    # 🚩 FIX: Ensure skills is ALWAYS saved as a valid JSON Array, never NULL
    profile.skills = data.get('skills', profile.skills or []) 
    
    db.session.commit()
    return jsonify({"message": "Profile Updated Successfully"}), 200


# 2. DASHBOARD MAIN ROUTE FIX
@student_bp.route('/dashboard-main', methods=['GET'])
@jwt_required()
def get_dashboard_main():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    profile = StudentProfile.query.get(user_id)

    if not profile:
        # 🚩 FIX: Added `skills=[]` so new profiles don't crash the Admin Dashboard
        profile = StudentProfile(user_id=user_id, current_streak=0, longest_streak=0, skills=[])
        db.session.add(profile)
        db.session.commit()

    # 1. STATS CALCULATION
    enrollments = Enrollment.query.filter_by(student_id=user_id).all()
    enrolled_courses_count = len(enrollments)
    completed_courses_count = sum(1 for e in enrollments if e.progress >= 100)
    
    student_badges = db.session.query(StudentBadge, Badge).join(Badge).filter(StudentBadge.student_id == user_id).order_by(StudentBadge.earned_at.desc()).all()
    
    recent_badge = None
    if student_badges:
        recent_badge = {
            "title": student_badges[0].Badge.title,
            "icon": student_badges[0].Badge.image_url
        }

    # 2. ENROLLED COURSES (For active display)
    active_courses = []
    for e in enrollments:
        if e.progress < 100:
            c = Course.query.get(e.course_id)
            active_courses.append({
                "id": c.course_id,
                "title": c.title,
                "progress": e.progress,
                "duration": c.duration
            })

    # 3. RECOMMENDATIONS LOGIC (Interest-based with fallback)
    enrolled_course_ids = [e.course_id for e in enrollments]
    interests = db.session.query(Interest.interest_name).join(StudentInterest).filter(StudentInterest.student_id == user_id).all()
    interest_names = [i[0] for i in interests]

    recommended = []
    if interest_names:
        recommended = Course.query.filter(Course.category.in_(interest_names), Course.course_id.notin_(enrolled_course_ids), Course.status == 'APPROVED').limit(3).all()
    
    if not recommended:
        recommended = Course.query.filter(Course.course_id.notin_(enrolled_course_ids), Course.status == 'APPROVED').order_by(Course.created_at.desc()).limit(3).all()

    recom_data = [{"id": c.course_id, "title": c.title, "category": c.category, "difficulty": c.difficulty_level} for c in recommended]

    return jsonify({
        "user_name": user.name, 
        "tricky_question": get_tricky_question(), 
        "profile": { 
            "name": user.name,
            "phone": user.phone,
            "skills": profile.skills or [] # 🚩 FIX: Fallback to empty array
        },
        "stats": {
            "enrolled": enrolled_courses_count,
            "completed": completed_courses_count,
            "badges": len(student_badges),
            "longest_streak": profile.longest_streak,
            "current_streak": profile.current_streak
        },
        "recent_badge": recent_badge,
        "active_courses": active_courses,
        "recommended_courses": recom_data
    }), 200

from models import Badge, StudentBadge

# ---------------------------------------------------------
# 🚩 ADD THIS ROUTE TO student.py
# ---------------------------------------------------------
@student_bp.route('/badges', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_my_badges():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    user_id = get_jwt_identity()
    
    # Fetch all platform badges
    all_badges = Badge.query.all()
    
    # Fetch what the student has actually earned
    earned_badges = StudentBadge.query.filter_by(student_id=user_id).all()
    
    # Map earned badge IDs to the date they were earned
    earned_map = {eb.badge_id: eb.earned_at.strftime("%d %b %Y") for eb in earned_badges}
    
    result = []
    for b in all_badges:
        result.append({
            "id": b.badge_id,
            "title": b.title,
            "description": b.description,
            "image_url": b.image_url,
            # Frontend uses these true/false flags to show lock/unlock icons
            "earned": b.badge_id in earned_map, 
            "earned_at": earned_map.get(b.badge_id, None)
        })
        
    return jsonify(result), 200

@student_bp.route('/explore-courses', methods=['GET'])
@jwt_required()
def explore_courses():
    user_id = get_jwt_identity()
    
    # Get IDs of courses the student is already enrolled in
    enrolled_ids = [e.course_id for e in Enrollment.query.filter_by(student_id=user_id).all()]
    
    # Fetch APPROVED courses they are NOT enrolled in
    available_courses = Course.query.filter(
        Course.status == 'APPROVED',
        Course.course_id.notin_(enrolled_ids) if enrolled_ids else True
    ).all()
    
    return jsonify([{
        "id": c.course_id,
        "title": c.title,
        "category": c.category,
        "difficulty": c.difficulty_level,
        "duration": c.duration,
        "rating": c.rating
    } for c in available_courses]), 200

@student_bp.route('/my-certificates', methods=['GET'])
@jwt_required()
def my_certificates():
    user_id = get_jwt_identity()
    certs = db.session.query(Certificate, Course).join(
        Course, Certificate.course_id == Course.course_id
    ).filter(Certificate.student_id == user_id).all()
    
    return jsonify([{
        "id": cert.certificate_id,
        "course_title": course.title,
        "issue_date": cert.issued_at.strftime('%Y-%m-%d'),
        "file_url": f"http://127.0.0.1:5000/download/certificate/{cert.file_path}"
    } for cert, course in certs]), 200

# 🚩 ADD THIS TO student.py
@student_bp.route('/enrolled-courses', methods=['GET'])
@jwt_required()
def get_enrolled_courses():
    user_id = get_jwt_identity()
    enrolled = db.session.query(Course, Enrollment).join(
        Enrollment, Course.course_id == Enrollment.course_id
    ).filter(Enrollment.student_id == user_id).all()
    
    return jsonify([{
        "id": c.course_id,
        "title": c.title,
        "category": c.category,
        "progress": e.progress,
        "duration": c.duration
    } for c, e in enrolled]), 200

# 🚩 ADD THIS TO student.py FOR THE NEW PROFILE DESIGN
@student_bp.route('/full-profile', methods=['GET'])
@jwt_required()
def get_full_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    profile = StudentProfile.query.get(user_id)
    
    # Calculate Stats
    completed_courses = Enrollment.query.filter_by(student_id=user_id).filter(Enrollment.progress >= 100).count()
    total_enrolled = Enrollment.query.filter_by(student_id=user_id).count()
    total_reviews = Rating.query.filter_by(student_id=user_id).count()
    earned_badges = db.session.query(Badge).join(StudentBadge).filter(StudentBadge.student_id == user_id).all()
    
    return jsonify({
        "user": {
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "joined": user.created_at.strftime("%B %Y") if user.created_at else "Recently"
        },
        "profile": {
            "skills": profile.skills or [],
            "current_streak": profile.current_streak or 0,
            "longest_streak": profile.longest_streak or 0,
        },
        "stats": {
            "completed_courses": completed_courses,
            "total_enrolled": total_enrolled,
            "badges_earned": len(earned_badges),
            "reviews_given": total_reviews
        },
        "recent_badges": [{"title": b.title, "icon": b.image_url} for b in earned_badges[:3]]
    }), 200



from models import db, StudentBadge, Badge, Enrollment, QuizResult, StudentProfile

# 🚩 AUTO-AWARD BADGES HELPER FUNCTION
def check_and_award_badges(student_id):
    # 1. Gather Student Stats
    enrolled_count = Enrollment.query.filter_by(student_id=student_id).count()
    completed_courses = Enrollment.query.filter_by(student_id=student_id, progress=100).count()
    passed_quizzes = QuizResult.query.filter_by(student_id=student_id, is_passed=True).count()
    perfect_quizzes = QuizResult.query.filter(QuizResult.student_id == student_id, QuizResult.percentage == 100).count() # Make sure percentage is calculated if you use this
    
    profile = StudentProfile.query.filter_by(user_id=student_id).first()
    streak = profile.current_streak if profile else 0

    # 2. Get all badges
    all_badges = Badge.query.all()
    
    # 3. Check what they already have
    earned_badges_ids = [b.badge_id for b in StudentBadge.query.filter_by(student_id=student_id).all()]

    new_badges_awarded = []

    # 4. Check eligibility and Award
    for badge in all_badges:
        if badge.badge_id in earned_badges_ids:
            continue # Already earned

        eligible = False
        if badge.badge_type == 'ENROLLMENT' and enrolled_count >= badge.threshold:
            eligible = True
        elif badge.badge_type == 'COURSE_COUNT' and completed_courses >= badge.threshold:
            eligible = True
        elif badge.badge_type == 'QUIZ_EXPERT' and passed_quizzes >= badge.threshold:
            eligible = True
        elif badge.badge_type == 'STREAK' and streak >= badge.threshold:
            eligible = True
        elif badge.badge_type == 'PERFECT_SCORE' and perfect_quizzes >= badge.threshold:
            eligible = True

        if eligible:
            new_student_badge = StudentBadge(student_id=student_id, badge_id=badge.badge_id)
            db.session.add(new_student_badge)
            new_badges_awarded.append(badge.title)

    if new_badges_awarded:
        db.session.commit()
        print(f"🎉 Awarded Badges to {student_id}: {new_badges_awarded}")


# ---------------------------------------------------------
# 🚩 RUN THIS ROUTE ONCE TO CREATE BADGES IN DATABASE
# ---------------------------------------------------------
@student_bp.route('/generate-badges', methods=['GET'])
def generate_badges():
    if Badge.query.count() == 0:
        badges_data = [
            {"title": "Beginner's Step", "desc": "Enrolled in your first course.", "type": "ENROLLMENT", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/star.png"},
            {"title": "On Fire", "desc": "Maintained a 3-day learning streak.", "type": "STREAK", "threshold": 3, "url": "https://img.icons8.com/3d-fluency/100/fire-element.png"},
            {"title": "Unstoppable", "desc": "Maintained a 7-day learning streak.", "type": "STREAK", "threshold": 7, "url": "https://img.icons8.com/3d-fluency/100/calendar.png"},
            {"title": "Quiz Novice", "desc": "Passed your first quiz.", "type": "QUIZ_EXPERT", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/test-passed.png"},
            {"title": "Quiz Master", "desc": "Passed 5 quizzes successfully.", "type": "QUIZ_EXPERT", "threshold": 5, "url": "https://img.icons8.com/3d-fluency/100/trophy.png"},
            {"title": "Perfectionist", "desc": "Scored a perfect 100% in a quiz.", "type": "PERFECT_SCORE", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/100-percent.png"},
            {"title": "Fast Learner", "desc": "Completed your first course.", "type": "COURSE_COUNT", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/rocket.png"},
            {"title": "Dedicated Scholar", "desc": "Completed 5 courses.", "type": "COURSE_COUNT", "threshold": 5, "url": "https://img.icons8.com/3d-fluency/100/graduation-cap.png"},
            {"title": "Knowledge Seeker", "desc": "Enrolled in 5 different courses.", "type": "ENROLLMENT", "threshold": 5, "url": "https://img.icons8.com/3d-fluency/100/book.png"},
            {"title": "Platform Legend", "desc": "Completed 10 courses. You are a legend!", "type": "COURSE_COUNT", "threshold": 10, "url": "https://img.icons8.com/3d-fluency/100/crown.png"}
        ]
        
        for b in badges_data:
            new_badge = Badge(
                title=b['title'], 
                description=b['desc'], 
                badge_type=b['type'], 
                threshold=b['threshold'], 
                image_url=b['url']
            )
            db.session.add(new_badge)
        
        db.session.commit()
        return jsonify({"message": "10 Premium Badges Successfully Created in Database! 🎉"}), 200

    return jsonify({"message": "Badges already exist in Database! 🚀"}), 200

# ---------------------------------------------------------
# 🚩 RUN THIS ROUTE ONCE TO RESET & FIX BROKEN BADGES
# ---------------------------------------------------------
@student_bp.route('/reset-badges', methods=['GET'])
def reset_badges():
    try:
        # 1. Delete old broken badges and student relationships
        StudentBadge.query.delete()
        Badge.query.delete()
        db.session.commit()

        # 2. Add the 10 Premium 3D Badges
        badges_data = [
            {"title": "Beginner's Step", "desc": "Enrolled in your first course.", "type": "ENROLLMENT", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/star.png"},
            {"title": "On Fire", "desc": "Maintained a 3-day learning streak.", "type": "STREAK", "threshold": 3, "url": "https://img.icons8.com/3d-fluency/100/fire-element.png"},
            {"title": "Unstoppable", "desc": "Maintained a 7-day learning streak.", "type": "STREAK", "threshold": 7, "url": "https://img.icons8.com/3d-fluency/100/calendar.png"},
            {"title": "Quiz Novice", "desc": "Passed your first quiz.", "type": "QUIZ_EXPERT", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/test-passed.png"},
            {"title": "Quiz Master", "desc": "Passed 5 quizzes successfully.", "type": "QUIZ_EXPERT", "threshold": 5, "url": "https://img.icons8.com/3d-fluency/100/trophy.png"},
            {"title": "Perfectionist", "desc": "Scored a perfect 100% in a quiz.", "type": "PERFECT_SCORE", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/100-percent.png"},
            {"title": "Fast Learner", "desc": "Completed your first course.", "type": "COURSE_COUNT", "threshold": 1, "url": "https://img.icons8.com/3d-fluency/100/rocket.png"},
            {"title": "Dedicated Scholar", "desc": "Completed 5 courses.", "type": "COURSE_COUNT", "threshold": 5, "url": "https://img.icons8.com/3d-fluency/100/graduation-cap.png"},
            {"title": "Knowledge Seeker", "desc": "Enrolled in 5 different courses.", "type": "ENROLLMENT", "threshold": 5, "url": "https://img.icons8.com/3d-fluency/100/book.png"},
            {"title": "Platform Legend", "desc": "Completed 10 courses. You are a legend!", "type": "COURSE_COUNT", "threshold": 10, "url": "https://img.icons8.com/3d-fluency/100/crown.png"}
        ]
        
        for b in badges_data:
            new_badge = Badge(
                title=b['title'], 
                description=b['desc'], 
                badge_type=b['type'], 
                threshold=b['threshold'], 
                image_url=b['url']
            )
            db.session.add(new_badge)
        
        db.session.commit()
        return jsonify({"message": "Broken Badges Deleted! 10 Premium Badges Successfully Created! 🎉"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500