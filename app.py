from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from models import db, Estimate
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# 데이터베이스 테이블 생성
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/board')
def board():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    query = Estimate.query
    if search:
        query = query.filter(Estimate.title.contains(search) | Estimate.content.contains(search))
    estimates = query.order_by(Estimate.created_at.desc()).paginate(page=page, per_page=10)
    return render_template('board.html', estimates=estimates, search=search)

@app.route('/board/new', methods=['GET', 'POST'])
def new_estimate():
    if request.method == 'POST':
        name = request.form['name']
        phone = request.form['phone']
        title = request.form['title']
        content = request.form['content']
        estimate = Estimate(name=name, phone=phone, title=title, content=content)
        db.session.add(estimate)
        db.session.commit()
        flash('견적문의가 등록되었습니다.', 'success')
        return redirect(url_for('board'))
    return render_template('new_estimate.html')

@app.route('/submit-quote', methods=['POST'])
def submit_quote():
    if request.method == 'POST':
        name = request.form['customer-name']
        phone = request.form['customer-phone']
        service_type = request.form['service-type']
        content = request.form['detailed-request']
        
        # 서비스 종류를 한글로 변환
        service_map = {
            'aircon': '에어컨 설치',
            'hvac': '냉난방 시스템',
            'ventilation': '환기 시스템',
            'maintenance': '정기 점검',
            'other': '기타'
        }
        title = service_map.get(service_type, service_type)
        
        estimate = Estimate(name=name, phone=phone, title=title, content=content)
        db.session.add(estimate)
        db.session.commit()
        flash('견적문의가 등록되었습니다.', 'success')
        return redirect(url_for('board'))
    return redirect(url_for('index'))

@app.route('/board/<int:id>')
def view_estimate(id):
    estimate = Estimate.query.get_or_404(id)
    return render_template('view_estimate.html', estimate=estimate)

@app.route('/board/<int:id>/delete', methods=['POST'])
def delete_estimate(id):
    estimate = Estimate.query.get_or_404(id)
    db.session.delete(estimate)
    db.session.commit()
    flash('견적문의가 삭제되었습니다.', 'success')
    return redirect(url_for('board'))

if __name__ == '__main__':
    app.run(debug=True) 