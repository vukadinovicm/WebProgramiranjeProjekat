from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from .database import db
from .models import Transaction, Category, User

bp_tx = Blueprint("transactions", __name__)  # url_prefix se postavlja u __init__.py

# --- helper: izvući user_id iz JWT (radi i kad je identity email ili dict) ---
def _get_current_user_id():
    ident = get_jwt_identity()
    if isinstance(ident, int):
        return ident
    if isinstance(ident, dict):
        if isinstance(ident.get("id"), int):
            return ident["id"]
        sub = ident.get("sub")
        if isinstance(sub, int):
            return sub
        if isinstance(sub, str) and "@" in sub:
            u = User.query.filter_by(email=sub).first()
            return u.id if u else None
    if isinstance(ident, str):
        try:
            return int(ident)
        except ValueError:
            if "@" in ident:
                u = User.query.filter_by(email=ident).first()
                return u.id if u else None
    return None

# --- helper: ISO string -> naive UTC datetime (tz removed) ---
def _parse_iso_naive_utc(s: str) -> datetime | None:
    if not s:
        return None
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    except Exception:
        return None

@bp_tx.get("/")
@jwt_required()
def list_tx():
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401

    q = Transaction.query.filter_by(user_id=uid)

    t = request.args.get("type")
    if t in ("INCOME", "EXPENSE"):
        q = q.filter_by(type=t)

    cid = request.args.get("category_id", type=int)
    if cid:
        q = q.filter_by(category_id=cid)

    dfrom = request.args.get("from") or request.args.get("date_from")
    dto   = request.args.get("to")   or request.args.get("date_to")

    if dfrom:
        dfp = _parse_iso_naive_utc(dfrom)
        if not dfp:
            return {"message": "date_from/from nije validan ISO datetime"}, 400
        q = q.filter(Transaction.date >= dfp)

    if dto:
        dtp = _parse_iso_naive_utc(dto)
        if not dtp:
            return {"message": "date_to/to nije validan ISO datetime"}, 400
        q = q.filter(Transaction.date <= dtp)

    items = q.order_by(Transaction.date.desc(), Transaction.id.desc()).all()
    return [{
        "id": x.id,
        "type": x.type,
        "amount": float(x.amount),
        "category_id": x.category_id,
        "date": x.date.isoformat(),
        "title": x.title,
        "note": x.note,
    } for x in items], 200

@bp_tx.post("/")
@jwt_required()
def create_tx():
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401

    data = request.get_json(silent=True) or {}

    type_ = (data.get("type") or "").strip().upper()
    if type_ not in ("INCOME", "EXPENSE"):
        return {"message": "type mora biti INCOME ili EXPENSE"}, 400

    # amount
    try:
        amount_num = float(data.get("amount"))
    except (TypeError, ValueError):
        return {"message": "amount mora biti broj"}, 400
    if amount_num < 0:
        return {"message": "amount mora biti >= 0"}, 400

    # category_id
    try:
        cat_id = int(data.get("category_id"))
    except (TypeError, ValueError):
        return {"message": "category_id mora biti integer"}, 400

    cat = Category.query.filter_by(id=cat_id, user_id=uid).first()
    if not cat:
        return {"message": "Kategorija ne postoji ili ne pripada korisniku"}, 404
    if cat.type != type_:
        return {"message": f"Tip transakcije ({type_}) ne odgovara tipu kategorije ({cat.type})"}, 400

    # date (ISO -> naive UTC datetime)
    dt = _parse_iso_naive_utc(data.get("date")) or datetime.utcnow()

    title = (data.get("title") or "").strip() or None
    note  = (data.get("note") or "").strip() or None

    tx = Transaction(
        user_id=uid,
        category_id=cat.id,
        type=type_,
        title=title,
        amount=amount_num,
        date=dt,
        note=note,
    )
    try:
        db.session.add(tx)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        return {"message": f"Greška pri upisu transakcije: {str(e)}"}, 400

    return {
        "id": tx.id,
        "type": tx.type,
        "amount": float(tx.amount),
        "category_id": tx.category_id,
        "date": tx.date.isoformat(),
        "title": tx.title,
        "note": tx.note,
    }, 201