import jwt, os
from functools import wraps
from flask import request, jsonify
from .models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            # Bearer <token> nundi token extract cheyali
            token_val = token.split(" ")[1]
            data = jwt.decode(token_val, os.getenv("SECRET_KEY"), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({"error": "Token is invalid"}), 401
        return f(current_user, *args, **kwargs)
    return decorated