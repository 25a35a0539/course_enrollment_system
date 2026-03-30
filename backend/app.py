from flask import Flask
from flask_cors import CORS
from config import SQLALCHEMY_DATABASE_URI

from models import db   
import models          

app = Flask(__name__)
CORS(app)

# DB CONFIG
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# INIT DB
db.init_app(app)


# ROUTE
@app.route("/")
def home():
    return {"message": "Backend running 🚀"}

# CREATE TABLES
with app.app_context():
    print("Creating tables...")
    db.create_all()



@app.route("/register", methods=["POST"])
def register():
    from models import User, StudentProfile, InstructorProfile, AdminProfile, db
    from flask import request
    import bcrypt


    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    phone = data.get("phone")

    # ✅ validation FIRST
    if not name or not email or not password or not role or not phone:
        return {"error": "All fields required"}, 400

    if role not in ["STUDENT", "INSTRUCTOR", "ADMIN"]:
        return {"error": "Invalid role"}, 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return {"error": "User already exists"}, 400

    # 🔐 hash password
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # ✅ create user ONLY after validation
    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password=hashed_pw.decode("utf-8"),
        role=role
    )

    

    db.session.add(new_user)
    db.session.flush()  # get user_id without commit

    # create profile
    if role == "STUDENT":
        profile = StudentProfile(user_id=new_user.user_id)
    elif role == "INSTRUCTOR":
        profile = InstructorProfile(user_id=new_user.user_id)
    else:
        profile = AdminProfile(user_id=new_user.user_id, role_level="ADMIN")

    db.session.add(profile)
    db.session.commit()

    return {"message": "User registered successfully 🚀"}

  
    

@app.route("/update-student-profile", methods=["PUT"])
def update_student_profile():
    from models import StudentProfile, db
    from flask import request

    
    data = request.json
    user_id = data.get("user_id")
    skills = data.get("skills")

    profile = StudentProfile.query.filter_by(user_id=user_id).first()

    if not profile:
        return {"error": "Profile not found"}, 404

    profile.skills = skills

    db.session.commit()

    return {"message": "Profile updated successfully"}

import jwt
import datetime

SECRET_KEY = "supersecretkey"

@app.route("/login", methods=["POST"])
def login():
    from models import User
    from flask import request
    import bcrypt

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"error": "User not found"}, 404

    if not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        return {"error": "Invalid password"}, 401

    # 🔐 CREATE TOKEN
    token = jwt.encode({
        "user_id": user.user_id,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm="HS256")

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.user_id,
            "name": user.name,
            "role": user.role
        }
    }


def token_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return {"error": "Token missing"}, 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except:
            return {"error": "Invalid token"}, 401

        return f(*args, **kwargs)
    return wrapper

    
# RUN APP
if __name__ == "__main__":
    app.run(debug=True)