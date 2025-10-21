from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .database import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, raw):
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw):
        return check_password_hash(self.password_hash, raw)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # 'INCOME' ili 'EXPENSE'

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # 'INCOME' ili 'EXPENSE'
    title = db.Column(db.String(120), nullable=True)  
    amount = db.Column(db.Numeric(14, 2), nullable=False)  # <- Numeric umesto Float
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # <- DateTime
    note = db.Column(db.String(255), nullable=True)
    
class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    month = db.Column(db.String(7), nullable=False)  # 'YYYY-MM'
    limit_amount = db.Column(db.Float, nullable=False)