from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import SQLALCHEMY_DATABASE_URI

app = Flask(__name__)
CORS(app)

# DB CONFIG
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -----------------------
# MODEL (TABLE)
# -----------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)

# -----------------------
# ROUTE
# -----------------------
@app.route("/")
def home():
    return {"message": "Backend running 🚀"}

# -----------------------
# CREATE TABLE
# -----------------------
with app.app_context():
    db.create_all()


from flask import request

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    
    email = data.get("email")
    password = data.get("password")

    # dummy check (for now)
    if email == "test@gmail.com" and password == "1234":
        return {"message": "Login successful"}
    
    return {"message": "Invalid credentials"}, 401



# -----------------------
# RUN APP
# -----------------------
if __name__ == "__main__":
    app.run(debug=True)