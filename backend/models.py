from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# ---------------- USERS ----------------
class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(150), unique=True)
    phone = db.Column(db.String(15), nullable=False)    
    password = db.Column(db.String(200))
    role = db.Column(db.String(20))
    status = db.Column(db.String(20), default="ACTIVE")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    last_login = db.Column(db.DateTime)

# ---------------- STUDENT PROFILE ----------------
class StudentProfile(db.Model):
    __tablename__ = "student_profile"

    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    skills = db.Column(db.JSON)
    progress_percentage = db.Column(db.Float, default=0)
    enrolled_course_count = db.Column(db.Integer, default=0)


# ---------------- INSTRUCTOR PROFILE ----------------
class InstructorProfile(db.Model):
    __tablename__ = "instructor_profile"

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    bio = db.Column(db.Text)
    expertise = db.Column(db.Text)
    experience_years = db.Column(db.Integer)
    rating = db.Column(db.Float, default=0)
    course_given_count = db.Column(db.Integer, default=0)


# ---------------- ADMIN PROFILE ----------------
class AdminProfile(db.Model):
    __tablename__ = "admin_profile"

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    role_level = db.Column(db.String(20))  # SUPER_ADMIN / ADMIN


# ---------------- COURSE ----------------
class Course(db.Model):
    __tablename__ = "course"

    course_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    instructor_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    category = db.Column(db.String(100))
    duration = db.Column(db.Integer)
    difficulty_level = db.Column(db.String(50))
    rating = db.Column(db.Float, default=0)


# ---------------- ENROLLMENT ----------------
class Enrollment(db.Model):
    __tablename__ = "enrollment"

    enrollment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    course_id = db.Column(db.Integer, db.ForeignKey("course.course_id"))
    enrollment_date = db.Column(db.DateTime, server_default=db.func.now())
    progress = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default="ACTIVE")
    remarks = db.Column(db.Text)


# ---------------- LESSON ----------------
class Lesson(db.Model):
    __tablename__ = "lesson"

    lesson_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.course_id"))
    title = db.Column(db.String(200))
    url = db.Column(db.Text)
    duration = db.Column(db.Integer)
    order_no = db.Column(db.Integer)


# ---------------- LESSON PROGRESS ----------------
class LessonProgress(db.Model):
    __tablename__ = "lesson_progress"

    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lesson.lesson_id"), primary_key=True)
    is_completed = db.Column(db.Boolean, default=False)


# ---------------- INTERESTS ----------------
class Interest(db.Model):
    __tablename__ = "interests"

    interest_id = db.Column(db.Integer, primary_key=True)
    interest_name = db.Column(db.String(100), unique=True)


# ---------------- STUDENT INTERESTS ----------------
class StudentInterest(db.Model):
    __tablename__ = "student_interests"

    student_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    interest_id = db.Column(db.Integer, db.ForeignKey("interests.interest_id"), primary_key=True)


# ---------------- QUIZ ----------------
class Quiz(db.Model):
    __tablename__ = "quiz"

    quiz_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.course_id"))
    total_marks = db.Column(db.Integer)
    passing_marks = db.Column(db.Integer)


# ---------------- QUESTION ----------------
class Question(db.Model):
    __tablename__ = "question"

    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.quiz_id"))
    question_text = db.Column(db.Text)


# ---------------- OPTION ----------------
class Option(db.Model):
    __tablename__ = "option"

    option_id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("question.question_id"))
    option_text = db.Column(db.Text)
    is_correct = db.Column(db.Boolean, default=False)


# ---------------- QUIZ RESULT ----------------
class QuizResult(db.Model):
    __tablename__ = "quiz_result"

    student_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.quiz_id"), primary_key=True)
    score = db.Column(db.Integer)
    is_passed = db.Column(db.Boolean)


# ---------------- RATING ----------------
class Rating(db.Model):
    __tablename__ = "rating"

    review_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    course_id = db.Column(db.Integer, db.ForeignKey("course.course_id"))
    rating = db.Column(db.Integer)
    comments = db.Column(db.Text)