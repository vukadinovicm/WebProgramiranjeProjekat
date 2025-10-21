from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .database import db
from .models import User, Category
import re

bp = Blueprint("auth", __name__)

def valid_password(p: str) -> bool:
    if not p or len(p) < 8:
        return False
    has_upper = re.search(r"[A-Z]", p)
    has_lower = re.search(r"[a-z]", p)
    has_num_or_sym = re.search(r"[\d\W]", p)
    return bool(has_upper and has_lower and has_num_or_sym)

@bp.post("/register")
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()
    name = (data.get("name") or "").strip()
    password = data.get("password") or ""

    if not name:
        return {"message": "ime i prezime su obavezni"}, 400
    if not email or not password:
        return {"message": "email i password su obavezni"}, 400
    if not valid_password(password):
        return {"message": "Lozinka mora imati min. 8 karaktera, bar jedno VELIKO i malo slovo i broj/simbol"}, 400
    if User.query.filter_by(email=email).first():
        return {"message": "email već postoji"}, 409

    user = User(email=email, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # seed osnovnih kategorija
    defaults = [
        ("Plata", "INCOME"),
        ("Hrana", "EXPENSE"),
        ("Prevoz", "EXPENSE"),
        ("Stanarina", "EXPENSE"),
    ]
    for n, t in defaults:
        db.session.add(Category(user_id=user.id, name=n, type=t))
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return {"access_token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}, 201

@bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return {"message": "pogrešan email ili lozinka"}, 401

    token = create_access_token(identity=str(user.id))
    return {"access_token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}, 200

@bp.get("/me")
@jwt_required()
def me():
    uid = int(get_jwt_identity())
    u = User.query.get(uid)
    return {"id": u.id, "email": u.email, "name": u.name}
