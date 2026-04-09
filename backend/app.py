from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from datetime import datetime, timedelta
import random
import bcrypt
import os
import json
from dotenv import load_dotenv
from flask_migrate import Migrate
from extensions import db , mail
from routes.instructor import instructor_bp
from models import db, User, OTP, StudentProfile, InstructorProfile, AdminProfile


from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity
)

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:5173"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
}}, supports_credentials=True)

# @app.after_request
# def add_cors_headers(response):
#     response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     response.headers.add('Access-Control-Allow-Credentials', 'true')
#     return response
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'SUPER_SECRET_KEY_SRI')
app.config['JWT_IGNORE_METHODS'] = ['OPTIONS']




load_dotenv()

# ---------------- DATABASE ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)
mail.init_app(app)
migrate = Migrate(app, db)

mail = Mail(app)
jwt = JWTManager(app)

# ---------------- MAIL CONFIG ----------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME']=os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")



mail = Mail(app)


# ---------------- SEND OTP ----------------
@app.route('/auth/send-otp', methods=['POST'])
def send_otp():
    email = request.json.get("email")

    # 🔴 CHECK EMAIL EXISTS
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    otp_code = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=5)

    OTP.query.filter_by(email=email).delete()

    db.session.add(OTP(email=email, otp=otp_code, expires_at=expiry))
    db.session.commit()

    msg = Message("OTP Verification",
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[email])
    msg.body = f"Your OTP is {otp_code}"
    mail.send(msg)

    return jsonify({"message": "OTP sent successfully"})



# ---------------- VERIFY REGISTER (FIXED) ----------------
@app.route('/auth/verify-register', methods=['POST'])
def verify_register():
    # 🔴 IKADA MARCHU: request.json badulu request.form vadali
    # Endukante manam frontend nundi FormData pampisthunnam
    if request.is_json:
        data = request.json
    else:
        data = request.form

    email = data.get("email")
    otp_input = data.get("otp")

    # 1. Check OTP
    record = OTP.query.filter_by(email=email, otp=otp_input).first()
    if not record:
        return jsonify({"error": "Invalid OTP"}), 400

    if record.expires_at < datetime.now():
        return jsonify({"error": "OTP expired"}), 400

    # 2. Handle Profile Image (Step 1 lo pampina image)
    profile_path = None
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        filename = secure_filename(file.filename)
        # Unique name kosam timestamp add chesthe inka manchidi
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        profile_path = save_path

    # 3. Hash Password
    hashed_pw = bcrypt.hashpw(
        data.get("password").encode(),
        bcrypt.gensalt()
    ).decode()

    user_status = 'PENDING' if data.get("role") == "INSTRUCTOR" else 'ACTIVE'

    # 4. Create User
    user = User(
        name=data.get("name"),
        email=email,
        phone=data.get("phone"),
        password=hashed_pw,
        role=data.get("role"),
        status=user_status,
        # profile_image: profile_path # Nee model lo ee field unte add chey
    )

    db.session.add(user)
    db.session.flush() 

    # 5. Create Profile Based on Role
    if user.role == "STUDENT":
        # Skills FormData lo string ga vasthundi, so list ga marchali
        skills_raw = data.get("skills", "[]")
        try:
            skills_list = json.loads(skills_raw)
        except:
            skills_list = []
            
        profile = StudentProfile(
            user_id=user.user_id,
            skills=skills_list
        )

    elif user.role == "INSTRUCTOR":
        profile = InstructorProfile(
            user_id=user.user_id,
            bio=data.get("bio"),
            expertise=data.get("expertise")
        )

    db.session.add(profile)
    db.session.delete(record)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})




from flask_jwt_extended import create_access_token,create_refresh_token



# @app.route('/auth/login', methods=['POST', 'OPTIONS'])
# def login():
#     if request.method == 'OPTIONS':
#         return jsonify({'status': 'ok'}), 200
#     data = request.json
#     user = User.query.filter_by(email=data.get('email')).first()
    
#     if not user:
#         return jsonify({"error": "User not found"}), 404

#     # 🟢 1. Password Hashing Check (Brutal Truth: Plain text vadaku!)
#     if bcrypt.checkpw(data['password'].encode(), user.password.encode()):
        
#         # 🔴 2. Instructor Pending Check
#         if user.role == "INSTRUCTOR" and user.status == "PENDING":
#             return jsonify({
#                 "error": "Account Pending",
#                 "message": "Your instructor account is under review. Please wait for Admin approval."
#             }), 403 # 403 ante Forbidden/Access Denied

#         # 🔵 3. Generate Token
#         access_token = create_access_token(
#             identity=str(user.user_id), 
#             additional_claims={"role": user.role}
#         )
#         refresh_token = create_refresh_token(
#             identity=str(user.user_id),
#             additional_claims={"role":user.role}
#         )
#         data = request.get_json()
        
#         if not data:
#             return jsonify({"error": "Missing JSON"}), 400
#         # app.py - Login route lo identity logic

#         return jsonify({
#             "access_token": access_token,
#             "refresh_token": refresh_token,
#             "role": user.role,
#             "user_id": user.user_id
#         }), 200
    
#     return jsonify({"error": "Invalid Credentials"}), 401


@app.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON"}), 400

    user = User.query.filter_by(email=data.get('email')).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if bcrypt.checkpw(data['password'].encode(), user.password.encode()):
        if user.role == "INSTRUCTOR" and user.status == "PENDING":
            return jsonify({"error": "Account Pending"}), 403

        # Token Generation
        access_token = create_access_token(identity=str(user.user_id), additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity=str(user.user_id), additional_claims={"role": user.role})

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
            "user_id": user.user_id
        }), 200
    
    return jsonify({"error": "Invalid Credentials"}), 401

@app.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True) # Specially for refresh tokens
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({"access_token": new_access_token}), 200


@app.route('/api/courses')
def all_courses():
    courses = Course.query.all()

    return jsonify([{
        "id": c.course_id,
        "title": c.title,
        "category": c.category,
        "rating": c.rating
    } for c in courses])



@app.route('/api/instructors')
def instructors():
    data = db.session.query(User, InstructorProfile).join(
        InstructorProfile, User.user_id == InstructorProfile.user_id
    ).all()

    return jsonify([{
        "name": u.name,
        "bio": i.bio,
        "expertise": i.expertise
    } for u, i in data])

@app.route('/api/testimonials')
def testimonials():
    reviews = Rating.query.limit(5).all()

    return jsonify([{
        "rating": r.rating,
        "comment": r.comments
    } for r in reviews])


from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/upload-profile', methods=['POST'])
def upload_profile():
    file = request.files['file']

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    return jsonify({"path": path})

from flask_jwt_extended import JWTManager


jwt = JWTManager(app)



app.register_blueprint(instructor_bp, url_prefix='/api/instructor')
# app.py lo idhi check chey
from routes.admin import admin_bp
app.register_blueprint(admin_bp, url_prefix='/api/admin') # 👈 '/api/admin' undali!
from routes.student import student_bp
app.register_blueprint(student_bp, url_prefix='/api/student')

# 🚩 ADD THIS TO app.py TO FIX THE 404 DOWNLOAD ERROR
from flask import send_from_directory

@app.route('/download/certificate/<filename>')
def download_certificate(filename):
    # Ensure this points to the exact folder where FPDF saved it
    cert_dir = os.path.join(app.root_path, 'uploads', 'certificates')
    return send_from_directory(cert_dir, filename)

if __name__ == "__main__":
    app.run(debug=True)
    

  