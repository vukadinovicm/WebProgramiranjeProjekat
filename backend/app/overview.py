from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from .database import db
from .models import Transaction, Category

bp_overview = Blueprint("overview", __name__)

@bp_overview.get("/")
@jwt_required()
def get_overview():
    uid = get_jwt_identity()
    month = request.args.get("month")
    base = db.session.query(
        Transaction.type, func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id==uid,
        func.substr(Transaction.date, 1, 7)==month
    ).group_by(Transaction.type).all()
    sums = {t: float(v or 0) for t, v in base}
    income = sums.get("INCOME", 0.0)
    expense = sums.get("EXPENSE", 0.0)
    # breakdown po kategorijama (rashodi)
    rows = db.session.query(
        Category.name, func.sum(Transaction.amount)
    ).join(Category, Category.id==Transaction.category_id).filter(
        Transaction.user_id==uid, Transaction.type=="EXPENSE",
        func.substr(Transaction.date,1,7)==month
    ).group_by(Category.name).all()
    total = float(expense)
    pie = [{"category": n, "amount": float(a), "share": (float(a)/total*100 if total else 0)} for n,a in rows]
    latest = db.session.query(Transaction).filter_by(user_id=uid).order_by(Transaction.date.desc()).limit(5).all()
    return {
        "income_total": income,
        "spending_total": expense,
        "balance": income - expense,
        "pie_breakdown": pie,
        "latest": [
            {"id": t.id, "title": t.title, "amount": t.amount, "date": t.date.isoformat()}
            for t in latest
        ]
    }
