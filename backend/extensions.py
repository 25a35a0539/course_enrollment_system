from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail # 🚩 NEW

db = SQLAlchemy()
mail = Mail() # 🚩 NEW: Initialize it here to avoid circular imports!