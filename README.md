<div align="center">

<img src="https://img.shields.io/badge/EduEnroll-Learning%20Platform-6366F1?style=for-the-badge&logo=graduation-cap&logoColor=white" alt="EduEnroll" height="50"/>

# EduEnroll — Full Stack Course Enrollment System

**A production-grade course enrollment platform built for the modern learner.**

**FullStack Development Lab Project | Btech II Year II Semster | Pragati Engineering College**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

<br/>

> *"Not just a course platform — an intelligent learning ecosystem with gamification, smart progress sync, and automated certification."*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Coming_Soon-6366F1?style=flat-square)](https://github.com)
[![Report Bug](https://img.shields.io/badge/🐛_Report_Bug-Issues-red?style=flat-square)](https://github.com)
[![Request Feature](https://img.shields.io/badge/✨_Feature_Request-Discussions-green?style=flat-square)](https://github.com)

</div>

---

##  Project Demo

<div align="center">

###  Platform Walkthrough

| Admin & Instructor Portal | Student Experience & Gamification |
|:---:|:---:|
| [![Admin Demo](VID-20260413-WA0077.mp4)] | [![Student Demo](https://img.shields.io/badge/▶_Watch-Student_Portal_Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com) |
| *Course creation, user management, credit distribution* | *Enrollment, badge earning, quiz & certification flow* |

###  Screenshots

| | |
|:---:|:---:|
| ![Dashboard](IMG-20260413-WA0073.jpg) | ![Course Builder](IMG-20260413-WA0068.jpg) |
| **Admin Dashboard** — User management & analytics | **Course Builder** — Lesson editor with video support |
| ![Student Portal](IMG-20260413-WA0076.jpg) | ![Badge Gallery](IMG-20260413-WA0069.jpg) |
| **Student Portal** — Progress tracking & enrollment | **Badge & Certificate Gallery** — Gamification hub |
| ![Student Portal](IMG-20260413-WA0071.jpg) | ![Badge Gallery](IMG-20260413-WA0075.jpg) |
| **Admin Portal** — Credits Managing | **Review & Feedback** — Course Review|

</div>

---

## Development Team

<div align="center">

| | Name |
|:---:|---|
| 1. | **K.S.T. Ramya Sri** | 
| 2. | **N. Param Singh Naik** | 
| 3. | **K. Reshma Srivalli** | 
| 4. | **N. Sampath** | 

</div>

---

## 🎓 Academic Context

| Detail | Info |
|---|---|
| **Institution** | Pragati Engineering College |
| **Program** | B.Tech Computer Science & Engineering |
| **Year / Semester** | 2nd Year — 2nd Semester |
| **Subject** | Full Stack Development Lab |
| **Submission Type** | Major Lab Project |

---

##  System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EduEnroll Platform                        │
│                                                                  │
│   ┌──────────────┐   ┌─────────────────┐   ┌────────────────┐  │
│   │ 👑 Admin     │   │ 🎓 Instructor   │   │ 📚 Student     │  │
│   │   Portal     │   │    Portal       │   │   Portal       │  │
│   └──────┬───────┘   └────────┬────────┘   └───────┬────────┘  │
│          │                    │                     │            │
│   ┌──────▼────────────────────▼─────────────────────▼────────┐ │
│   │              React + Vite Frontend (SPA)                  │ │
│   │         Tailwind CSS • Framer Motion • Lucide Icons       │ │
│   └──────────────────────────┬────────────────────────────────┘ │
│                              │  REST API (JWT Auth)              │
│   ┌──────────────────────────▼────────────────────────────────┐ │
│   │                  Flask Backend API                         │ │
│   │     SQLAlchemy ORM • FPDF • Flask-Mail • JWT              │ │
│   └──────────────────────────┬────────────────────────────────┘ │
│                              │                                   │
│   ┌──────────────────────────▼────────────────────────────────┐ │
│   │              PostgreSQL Database                           │ │
│   └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

##  Key Features

###  Smart Progress Sync — Delta Patching Algorithm
> **The problem:** When an instructor adds or removes lessons from an active course, enrolled students' completion percentages break — they either jump to 100% or reset to 0%.

> **Our solution:** EduEnroll implements a **delta-patching algorithm** that diffs the new lesson set against the old one, preserving completed lesson states and recalculating progress proportionally. Student data is **never lost or corrupted**, even with structural course changes.

---

###  95 + 5 Progress Rule
Progress is split into two meaningful phases:

```
█████████████████████████████████████████████░░░░░░  95% — Lesson completion
                                              █████   5%  — Quiz passage (locked until 95%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              100% = Certificate Unlocked 🎓
```

- **95%** of progress is earned by completing individual video lessons
- **Final 5%** is gated behind passing the end-of-course quiz
- This enforces genuine comprehension before awarding a certificate

---

### 🏆 Gamification System

EduEnroll features a **premium 3D badge system** with **10+ unique badges** and a **learning streak tracker** designed to keep students engaged.

| Badge Tier | Criteria | Count |
|:---:|:---:|:---:|
| 🥉 **Bronze** | 1st course enrolled, first lesson done | 2 |
| 🥈 **Silver** | 3-day streak, 50% course completion | 3 |
| 🥇 **Gold** | Course completed, quiz aced | 2 |
| 💎 **Diamond** | 7-day streak, 3 courses completed | 2 |
| 🔮 **Legendary** | Platform top-scorer, mentor badge | 2+ |

---

###  Automated PDF Certification
Upon reaching 100% course completion, EduEnroll:
1. Automatically generates a **personalized PDF certificate** using FPDF
2. Embeds student name, course title, completion date, and instructor signature
3. **Emails the certificate** directly to the student via Flask-Mail
4. Stores a downloadable copy in the student's profile

---

##  Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Flask** | REST API framework |
| **SQLAlchemy** | ORM & database abstraction |
| **PostgreSQL** | Primary relational database |
| **JWT (Flask-JWT-Extended)** | Stateless authentication & authorization |
| **FPDF** | PDF certificate generation |
| **Flask-Mail** | Automated email delivery |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component library |
| **Vite** | Next-gen build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **Lucide React** | Clean, consistent icon set |

---

## Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/EduEnroll.git
cd EduEnroll

# 2. Set up a virtual environment
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/eduenroll_db
JWT_SECRET_KEY=your-super-secret-jwt-key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

```bash
# 5. Initialize the database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 6. Start the Flask development server
flask run
# API now running at: http://localhost:5000
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend directory (open a new terminal)
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
# 4. Start the Vite development server
npm run dev
# App now running at: http://localhost:5173
```

---

## Portal Functionality

### 👑 Admin Portal
- Manage all registered users (students & instructors)
- Approve or reject instructor-submitted courses
- Distribute learning credits to students
- Issue and revoke certificates manually
- View platform-wide analytics

### 🎓 Instructor Portal
- Create, edit, and publish courses
- Add video lessons with descriptions and ordering
- Build course quizzes with custom questions
- Track real-time student progress across enrollments
- Receive notifications on course completions

### 📚 Student Portal
- Browse and enroll in available courses
- Track granular lesson-by-lesson progress
- Earn 3D badges and maintain learning streaks
- Take course quizzes to unlock certification
- Download and receive PDF certificates via email

---

## 🗂️ Project Structure

```
EduEnroll/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy database models
│   │   ├── routes/          # API route blueprints (admin, instructor, student)
│   │   ├── services/        # Business logic (progress, badges, certificates)
│   │   ├── utils/           # Delta-patching, JWT helpers, email service
│   │   └── __init__.py      # App factory
│   ├── migrations/          # Alembic migration files
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Admin, Instructor, Student page views
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API call functions
│   │   └── assets/          # 3D badge images, icons
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---


## 📄 License

This project was developed for academic purposes at Pragati Engineering College. All rights reserved by the team members.

---

<div align="center">

Built with ❤️ by Team EduEnroll · Pragati Engineering College · 2024–25

⭐ **If this project helped you, please give it a star!** ⭐

</div>
