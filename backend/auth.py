from flask import Blueprint, request, jsonify
import bcrypt, jwt, datetime, os
from models import db, User, StudentProfile, InstructorProfile, OTP

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key")

# --- LOGIN API ---
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()

    if not user or not bcrypt.checkpw(data["password"].encode(), user.password.encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    # Token generate cheyadam (Role kuda add chesam)
    token = jwt.encode({
        "user_id": user.user_id,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "token": token,
        "user": {"id": user.user_id, "name": user.name, "role": user.role}
    }), 200

# --- UPDATE PROFILE API (With Token Security) ---
@auth_bp.route("/update-profile", methods=["PUT"])
def update_profile():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token missing!"}), 401
    
    try:
        # 'Bearer <token>' nundi extract cheyadam
        token_val = token.split(" ")[1]
        decoded = jwt.decode(token_val, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded['user_id']
    except:
        return jsonify({"error": "Invalid token!"}), 401

    user = User.query.get(user_id)
    data = request.json

    # Basic Info Update
    user.name = data.get("name", user.name)
    user.phone = data.get("phone", user.phone)
    user.profile_image = data.get("profile_image", user.profile_image)

    # Role wise profiles update
    if user.role == "STUDENT":
        profile = StudentProfile.query.get(user_id)
        if profile:
            profile.skills = data.get("skills", profile.skills)
    elif user.role == "INSTRUCTOR":
        profile = InstructorProfile.query.get(user_id)
        if profile:
            profile.bio = data.get("bio", profile.bio)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

from flask import Blueprint, request, jsonify
# from flask_mail import Message
from models import db, User, OTP, StudentProfile, InstructorProfile, AdminProfile
import datetime, random, bcrypt, re
# from app import mail # Main app nundi mail import cheskovali

auth_bp = Blueprint('auth', __name__)

# --- Helper: Email Body Design ---
def send_otp_email(email, otp):
    from app import mail
    from app import mail  # Ikkada pettu, appudu circular import raadu ✅
    from flask_mail import Message

    msg = Message("Verify Your Account - Smart Enrollment", recipients=[email])
    msg.html = f"""
    <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #0ea5e9; text-align: center;">Smart Enrollment System</h2>
        <p>Hello,</p>
        <p>Thank you for registering. Use the following OTP to verify your account. This code is valid for <b>5 minutes</b>.</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f0f9ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #0ea5e9;">
                {otp}
            </span>
        </div>
        <p style="color: #666; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
    </div>
    """
    mail.send(msg)

# --- API 1: Send OTP ---
@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    email = data.get("email")
    
    # Phone number validation (repeated digits check)
    phone = data.get("phone")
    if phone and (len(set(phone)) == 1):
        return jsonify({"error": "Invalid phone number (Repeated digits)"}), 400

    otp = str(random.randint(100000, 999999))
    
    # Store/Update OTP in DB
    otp_record = OTP.query.filter_by(email=email).first()
    if otp_record:
        otp_record.otp = otp
        otp_record.expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    else:
        db.session.add(OTP(email=email, otp=otp, expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=5)))
    
    db.session.commit()

    try:
        send_otp_email(email, otp)
        return jsonify({"message": "OTP sent"}), 200
    except Exception as e:
        print(f"MAIL ERROR: {e}") # Idhi terminal lo kanipisthundi
        return jsonify({"error": "Failed to send email. Check backend logs."}), 500
    
    # try:
    #     send_otp_email(email, otp)
    #     return jsonify({"message": "OTP sent successfully"}), 200
    # except Exception as e:
    #     return jsonify({"error": "Failed to send email"}), 500

# --- API 2: Verify & Final Register ---
@auth_bp.route("/verify-register", methods=["POST"])
def verify_register():
    data = request.json
    
    # 1. OTP Check
    otp_record = OTP.query.filter_by(email=data.get("email"), otp=data.get("otp")).first()
    if not otp_record or otp_record.expires_at < datetime.datetime.utcnow():
        return jsonify({"error": "Invalid or expired OTP"}), 400

    # 2. Check if user exists
    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "Email already registered"}), 400

    # 3. Hash Password & Create User
    hashed_pw = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    
    new_user = User(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        password=hashed_pw,
        role=data.get("role").upper()
    )
    
    db.session.add(new_user)
    db.session.flush() # user_id generation

    # 4. Role-based Profile Initialization (Empty for now)
    if new_user.role == "STUDENT":
        db.session.add(StudentProfile(user_id=new_user.user_id))
    elif new_user.role == "INSTRUCTOR":
        db.session.add(InstructorProfile(user_id=new_user.user_id))
    elif new_user.role == "ADMIN":
        db.session.add(AdminProfile(user_id=new_user.user_id, role_level="MODERATOR"))

    db.session.delete(otp_record) # OTP cleanup
    db.session.commit()
    
    return jsonify({
        "message": "Registration successful!",
        "user_id": new_user.user_id,
        "role": new_user.role
    }), 201