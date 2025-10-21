from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .database import db
from .models import Category, User

bp_categories = Blueprint("categories", __name__)  # registruj sa url_prefix="/categories"

def _get_current_user_id():
    
    ident = get_jwt_identity()
    # int -> već je user_id
    if isinstance(ident, int):
        return ident

    # dict -> pokušaj id/sub
    if isinstance(ident, dict):
        if "id" in ident and isinstance(ident["id"], int):
            return ident["id"]
        if "sub" in ident:
            maybe = ident["sub"]
            if isinstance(maybe, int):
                return maybe
            if isinstance(maybe, str) and "@" in maybe:
                user = User.query.filter_by(email=maybe).first()
                return user.id if user else None

    # string -> može biti email ili string-ID
    if isinstance(ident, str):
        # pokušaj int iz stringa
        try:
            return int(ident)
        except ValueError:
            # tretiraj kao email
            if "@" in ident:
                user = User.query.filter_by(email=ident).first()
                return user.id if user else None

    return None


@bp_categories.get("/")
@jwt_required()
def list_categories():
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401

    items = Category.query.filter_by(user_id=uid).order_by(Category.name.asc()).all()
    return [{"id": c.id, "name": c.name, "type": c.type} for c in items], 200


@bp_categories.post("/")
@jwt_required()
def create_category():
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    type_ = (data.get("type") or "").strip().upper()

    if not name or type_ not in ("INCOME", "EXPENSE"):
        return {"message": "Polja 'name' i 'type' (INCOME/EXPENSE) su obavezna."}, 400

    # duplikat po korisniku + tipu + imenu
    exists = Category.query.filter_by(user_id=uid, name=name, type=type_).first()
    if exists:
        return {"message": "Kategorija sa tim imenom već postoji za taj tip."}, 409

    c = Category(user_id=uid, name=name, type=type_)
    db.session.add(c)
    db.session.commit()

    return {"id": c.id, "name": c.name, "type": c.type}, 201