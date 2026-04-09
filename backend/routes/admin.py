from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
# from flask_mail import Message # Mail vaduthunte idhi un-comment chey
from sqlalchemy import func, desc, text
from models import db, User, Course, Enrollment, InstructorProfile, AdminProfile

admin_bp = Blueprint('admin', __name__)

import os
from datetime import date
from functools import wraps
from fpdf import FPDF
from flask import Blueprint, jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from sqlalchemy import func
from models import db, User, Course, Enrollment, InstructorProfile, StudentProfile, Certificate

admin_bp = Blueprint('admin', __name__)

# --- UTILS: ROLE CHECK ---
def is_admin():
    claims = get_jwt()
    role = claims.get('role', 'NO_ROLE_FOUND')
    print(f"DEBUG: Claims received -> {claims}") # Check your terminal for this!
    print(f"DEBUG: Role found -> {role}")
    
    return str(role).upper() == 'ADMIN'

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            if not is_admin():
                return jsonify(msg="Admins only!"), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# --- PDF GENERATOR UTIL ---
def generate_pdf_certificate(user_name, course_title, cert_id):
    # Ensure directory exists
    cert_dir = os.path.join('uploads', 'certificates')
    if not os.path.exists(cert_dir):
        os.makedirs(cert_dir)

    pdf = FPDF(orientation='L', unit='mm', format='A4')
    pdf.add_page()
    
    # Border (EDUADMIN Style)
    pdf.set_line_width(2)
    pdf.rect(10, 10, 277, 190)
    
    # Use 'helvetica' (Standard across all FPDF versions)
    pdf.set_font('helvetica', 'B', 40)
    pdf.cell(0, 50, 'CERTIFICATE OF COMPLETION', ln=True, align='C')
    
    pdf.set_font('helvetica', '', 20)
    pdf.cell(0, 20, 'This is to certify that', ln=True, align='C')
    
    pdf.set_font('helvetica', 'B', 30)
    pdf.cell(0, 20, user_name.upper(), ln=True, align='C')
    
    pdf.set_font('helvetica', '', 20)
    pdf.cell(0, 20, f'has successfully completed the course', ln=True, align='C')
    
    pdf.set_font('helvetica', 'I', 25)
    pdf.cell(0, 20, f'"{course_title}"', ln=True, align='C')
    
    # Footer Metadata
    pdf.set_font('helvetica', '', 10)
    pdf.set_y(170)
    pdf.cell(0, 10, f'Certificate ID: {cert_id} | Issued on: {date.today()}', align='C')
    
    file_name = f"cert_{cert_id}.pdf"
    file_path = os.path.join(cert_dir, file_name)
    pdf.output(file_path)
    return file_name

# --- 1. CERTIFICATE QUEUE & ISSUANCE ---

@admin_bp.route('/pending-certificates', methods=['GET'])
@admin_required()
def list_pending_certificates():
    # Fetch enrollments with 100% progress that don't have a certificate yet
    issued_course_ids = db.session.query(Certificate.course_id).filter(Certificate.student_id == Enrollment.student_id)
    
    pending = db.session.query(Enrollment, User, Course).join(
        User, Enrollment.student_id == User.user_id
    ).join(
        Course, Enrollment.course_id == Course.course_id
    ).filter(
        Enrollment.progress >= 100
    ).all()

    output = []
    for enroll, user, course in pending:
        # Check if already issued
        exists = Certificate.query.filter_by(student_id=user.user_id, course_id=course.course_id).first()
        if not exists:
            output.append({
                "enrollment_id": enroll.enrollment_id,
                "student_name": user.name,
                "course_title": course.title
            })
    return jsonify(output), 200


from flask_mail import Message
from extensions import mail # 🚩 Import mail safely from extensions

@admin_bp.route('/issue-certificate/<int:enrollment_id>', methods=['POST'])
@admin_required()
def issue_certificate(enrollment_id):
    enrollment = Enrollment.query.get_or_404(enrollment_id)
    
    if enrollment.progress < 100:
        return jsonify({"error": "Course not completed"}), 400

    user = User.query.get(enrollment.student_id)
    course = Course.query.get(enrollment.course_id)

    # Prevent duplicates
    existing = Certificate.query.filter_by(student_id=user.user_id, course_id=course.course_id).first()
    if existing:
        return jsonify({"error": "Certificate already issued"}), 400

    # 1. Database Entry
    new_cert = Certificate(
        student_id=user.user_id,
        course_id=course.course_id
    )
    db.session.add(new_cert)
    db.session.flush() 

    # 2. Generate PDF
    file_name = generate_pdf_certificate(user.name, course.title, new_cert.certificate_id)
    new_cert.file_path = file_name
    db.session.commit()

    # 3. 🚀 EMAIL AUTOMATION LOGIC 
    try:
        msg = Message(
            subject=f"🎓 Congratulations! Your Certificate for {course.title}",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[user.email]
        )
        
        # Email Body
        msg.body = f"""Hello {user.name},

Congratulations on successfully completing "{course.title}"! 🚀
We have verified your progress, and your official certificate is attached to this email.

Keep learning and growing!

Best Regards,
EduAdmin System
"""
        # Attach the PDF
        pdf_path = os.path.join('uploads', 'certificates', file_name)
        with open(pdf_path, 'rb') as pdf_file:
            msg.attach(file_name, "application/pdf", pdf_file.read())

        # Send Email
        mail.send(msg)
        
    except Exception as e:
        print(f"Brutal Error Sending Email: {e}")
        # Note: We return 200 anyway because the cert WAS generated, even if email failed.
        return jsonify({"message": "Certificate Issued, but Email failed to send.", "file": file_name}), 200

    return jsonify({"message": "Certificate Issued & Emailed Successfully! ✉️", "file": file_name}), 200


from functools import wraps

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            if not is_admin():
                return jsonify(msg="Admins only!"), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# --- 1. DASHBOARD OVERVIEW ---
@admin_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_stats():
    
    # Logic to count how many students are at 100% but have NO certificate
    pending_certs_count = db.session.query(Enrollment).filter(
        Enrollment.progress >= 100,
        ~Enrollment.student_id.in_(
            db.session.query(Certificate.student_id).filter(Certificate.course_id == Enrollment.course_id)
        )
    ).count()

    stats = {
        "total_students": User.query.filter_by(role='STUDENT').count(),
        "total_instructors": User.query.filter_by(role='INSTRUCTOR').count(),
        "active_instructors": User.query.filter_by(role='INSTRUCTOR', status='ACTIVE').count(),
        "pending_instructors": User.query.filter_by(role='INSTRUCTOR', status='PENDING').count(),
        "active_courses": Course.query.filter_by(status='APPROVED').count(),
        "pending_courses": Course.query.filter_by(status='PENDING').count(), # 🚩 FIXED: This was missing!
        "pending_certificates": pending_certs_count # 🚩 NEW: Added this for the UI
    }
    return jsonify(stats), 200

# --- 2. INSTRUCTOR MANAGEMENT ---
@admin_bp.route('/pending-instructors', methods=['GET'])
@jwt_required()
def list_pending_instructors():
    if not is_admin(): return jsonify({"error": "Forbidden"}), 403
    pending = User.query.filter_by(role='INSTRUCTOR', status='PENDING').all()
    return jsonify([{"user_id": u.user_id, "name": u.name, "email": u.email} for u in pending]), 200

@admin_bp.route('/approve-instructor/<int:user_id>', methods=['POST'])
@jwt_required()
def approve_instructor(user_id):
    if not is_admin(): return jsonify({"error": "Forbidden"}), 403
    user = User.query.get_or_404(user_id)
    user.status = 'ACTIVE'
    db.session.commit()
    return jsonify({"message": f"Instructor {user.name} Approved"}), 200

# --- 3. COURSE & CREDIT MANAGEMENT ---


# routes/admin.py
@admin_bp.route('/pending-courses', methods=['GET'])
@jwt_required()
def list_pending_courses():
    if not is_admin(): return jsonify({"error": "Forbidden"}), 403
    
    pending = Course.query.filter_by(status='PENDING').all()
    
    # Logic: c.instructor badulu manual ga User query vaadi name theddam
    output = []
    for c in pending:
        instructor = User.query.get(c.instructor_id) # instructor_id kachitanga untundi
        output.append({
            "course_id": c.course_id,
            "title": c.title,
            "instructor": instructor.name if instructor else "Unknown"
        })
    
    return jsonify(output), 200
from models import db, User, StudentProfile, InstructorProfile

@admin_bp.route('/approve-course/<int:course_id>', methods=['POST'])
@jwt_required()
def approve_course(course_id):
    if not is_admin(): return jsonify({"error": "Forbidden"}), 403
    data = request.json
    course = Course.query.get_or_404(course_id)
    course.status = 'APPROVED'
    
    inst = InstructorProfile.query.filter_by(user_id=course.instructor_id).first()
    if inst: 
        inst.credits += data.get('credits', 0)
    
    db.session.commit()
    return jsonify({"message": "Course Approved & Credits assigned"}), 200

# --- 4. VIEW ALL USERS ---

@admin_bp.route('/all-users', methods=['GET'])
@jwt_required()
def get_all_users():
    role = request.args.get('role', 'STUDENT')
    users = User.query.filter_by(role=role).all()
    
    # List ki kavalsina basic details mathrame
    users_list = [{
        "user_id": u.user_id,
        "name": u.name,
        "email": u.email,
        "status": u.status,
        "role": u.role
    } for u in users]
    
    return jsonify(users_list), 200

@admin_bp.route('/user-details/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    user = User.query.get_or_404(user_id)
    profile_data = {}

    if user.role == 'STUDENT':
        profile = StudentProfile.query.filter_by(user_id=user_id).first()
        profile_data = {
            "skills": profile.skills if profile else "",
            "progress": profile.progress_percentage if profile else 0,
            "education": profile.education if hasattr(profile, 'education') else "N/A"
        }
    else: # INSTRUCTOR
        profile = InstructorProfile.query.filter_by(user_id=user_id).first()
        profile_data = {
            "bio": profile.bio if profile else "",
            "expertise": profile.expertise if profile else "",
            "credits": profile.credits if profile else 0,
            "rating": profile.rating if profile else 0
        }

    # Combine everything
    full_details = {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "status": user.status,
        "joined_at": user.created_at.strftime('%Y-%m-%d'),
        "profile_image": f"http://127.0.0.1:5000/static/uploads/{profile.profile_pic}" if profile and hasattr(profile, 'profile_pic') and profile.profile_pic else None,
        **profile_data
    }
    return jsonify(full_details), 200

@admin_bp.route('/remove-user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_user(user_id):
    if not is_admin(): return jsonify({"error": "Forbidden"}), 403
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User removed successfully"}), 200


@admin_bp.route('/manage-credits', methods=['POST'])
@jwt_required()
def manage_credits():
    # 🚩 Logic check: Current user admin kaada ani confirm chey
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'ADMIN':
        return jsonify({"error": "Unauthorized Access. Admins only!"}), 403
    data = request.json
    user_ids = data.get('user_ids', []) # Bulk kosam list pampali
    amount = data.get('amount', 0) # +10 or -10
    
    instructors = InstructorProfile.query.filter(InstructorProfile.user_id.in_(user_ids)).all()
    for inst in instructors:
    # If credits is None (NULL in DB), treat it as 0
        if inst.credits is None:
            inst.credits = 0
            
        inst.credits += amount
    
    db.session.commit()
    return jsonify({"message": f"Updated credits for {len(instructors)} instructors"}), 200

@admin_bp.route('/remove-course/<int:course_id>', methods=['DELETE'])
@jwt_required()
def remove_course(course_id):
    if not is_admin(): return jsonify({"error": "Forbidden"}), 403
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course removed from platform"}), 200
