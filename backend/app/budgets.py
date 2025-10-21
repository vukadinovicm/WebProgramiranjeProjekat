from datetime import datetime
from calendar import monthrange
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from .database import db
from .models import Budget, Category, Transaction, User

bp_budgets = Blueprint("budgets", __name__)  # registruje se u __init__.py sa url_prefix="/api/budgets"

# — helpers —
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

def _month_range(yyyy_mm: str):
    # yyyy_mm -> (start_datetime, end_datetime_inclusive)
    try:
        y, m = map(int, yyyy_mm.split("-"))
        start = datetime(y, m, 1, 0, 0, 0)
        last_day = monthrange(y, m)[1]
        end = datetime(y, m, last_day, 23, 59, 59, 999000)
        return start, end
    except Exception:
        return None, None

# — CRUD budgeta —

@bp_budgets.get("/")
@jwt_required()
def list_budgets():
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401
    items = Budget.query.filter_by(user_id=uid).order_by(Budget.month.desc()).all()
    return [{
        "id": b.id,
        "category_id": b.category_id,
        "month": b.month,               # 'YYYY-MM'
        "limit_amount": float(b.limit_amount),
    } for b in items], 200

@bp_budgets.post("/")
@jwt_required()
def create_budget():
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401

    data = request.get_json(silent=True) or {}
    month = (data.get("month") or "").strip()   # 'YYYY-MM'
    try:
        cat_id = int(data.get("category_id"))
        limit_amount = float(data.get("limit_amount"))
    except (TypeError, ValueError):
        return {"message": "category_id (int) i limit_amount (broj) su obavezni"}, 400
    if limit_amount < 0:
        return {"message": "limit_amount mora biti >= 0"}, 400
    if len(month) != 7 or "-" not in month:
        return {"message": "month mora biti formata YYYY-MM"}, 400

    cat = Category.query.filter_by(id=cat_id, user_id=uid).first()
    if not cat:
        return {"message": "Kategorija ne postoji ili ne pripada korisniku"}, 404

    exists = Budget.query.filter_by(user_id=uid, category_id=cat_id, month=month).first()
    if exists:
        return {"message": "Budžet za tu kategoriju i mesec već postoji"}, 409

    b = Budget(user_id=uid, category_id=cat_id, month=month, limit_amount=limit_amount)
    db.session.add(b)
    db.session.commit()
    return {"id": b.id, "category_id": b.category_id, "month": b.month, "limit_amount": float(b.limit_amount)}, 201

@bp_budgets.put("/<int:bid>")
@bp_budgets.patch("/<int:bid>")
@jwt_required()
def update_budget(bid):
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401
    b = Budget.query.filter_by(id=bid, user_id=uid).first()
    if not b:
        return {"message": "Budžet ne postoji"}, 404

    data = request.get_json(silent=True) or {}
    if "limit_amount" in data:
        try:
            val = float(data["limit_amount"])
        except (TypeError, ValueError):
            return {"message": "limit_amount mora biti broj"}, 400
        if val < 0:
            return {"message": "limit_amount mora biti >= 0"}, 400
        b.limit_amount = val
    if "month" in data:
        m = (data["month"] or "").strip()
        if len(m) != 7 or "-" not in m:
            return {"message": "month mora biti YYYY-MM"}, 400
        b.month = m
    if "category_id" in data:
        try:
            cat_id = int(data["category_id"])
        except (TypeError, ValueError):
            return {"message": "category_id mora biti integer"}, 400
        cat = Category.query.filter_by(id=cat_id, user_id=uid).first()
        if not cat:
            return {"message": "Kategorija ne postoji ili ne pripada korisniku"}, 404
        b.category_id = cat_id

    db.session.commit()
    return {"id": b.id, "category_id": b.category_id, "month": b.month, "limit_amount": float(b.limit_amount)}, 200

@bp_budgets.delete("/<int:bid>")
@jwt_required()
def delete_budget(bid):
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401
    b = Budget.query.filter_by(id=bid, user_id=uid).first()
    if not b:
        return {"message": "Budžet ne postoji"}, 404
    db.session.delete(b)
    db.session.commit()
    return {"ok": True}, 200

# — SUMMARY: potrošnja po kategorijama za dati mesec (samo EXPENSE) —
@bp_budgets.get("/summary")
@jwt_required()
def budgets_summary():
    """
    Query params:
      - month=YYYY-MM (obavezno); računa SUM(expense) po kategoriji za opseg meseca
    Response:
      [{ category_id, category_name, limit_amount, spent, remaining, month }]
    """
    uid = _get_current_user_id()
    if not uid:
        return {"message": "Nevažeći token ili korisnik ne postoji"}, 401

    month = request.args.get("month")
    if not month:
        # default: tekući mesec
        month = datetime.utcnow().strftime("%Y-%m")
    start, end = _month_range(month)
    if not start:
        return {"message": "month mora biti YYYY-MM"}, 400

    # budzet = user+month
    budgets = Budget.query.filter_by(user_id=uid, month=month).all()

    # potroseno po kategoriji (EXPENSE) u mesecu
    spent_rows = (
        db.session.query(
            Transaction.category_id,
            func.coalesce(func.sum(Transaction.amount), 0.0).label("spent"),
        )
        .filter(
            Transaction.user_id == uid,
            Transaction.type == "EXPENSE",
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .group_by(Transaction.category_id)
        .all()
    )
    spent_map = {row.category_id: float(row.spent) for row in spent_rows}

    # imena kategorija
    cats = Category.query.filter_by(user_id=uid).all()
    cat_map = {c.id: c.name for c in cats}

    out = []
    for b in budgets:
        spent = spent_map.get(b.category_id, 0.0)
        remaining = float(b.limit_amount) - spent
        out.append({
            "month": month,
            "category_id": b.category_id,
            "category_name": cat_map.get(b.category_id, "—"),
            "limit_amount": float(b.limit_amount),
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
        })
    return out, 200
