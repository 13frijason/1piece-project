from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from models import db, Construction
from supabase import create_client, Client
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Supabase 클라이언트 초기화
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# SQLAlchemy 초기화
db = SQLAlchemy(app)

# Construction 모델 정의
class Construction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

# 데이터베이스 초기화
with app.app_context():
    db.create_all()

class Estimate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120))
    address = db.Column(db.String(200), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='대기중')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'service_type': self.service_type,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

def init_db():
    db_path = os.path.join(app.instance_path, 'estimates.db')
    
    if not os.path.exists(app.instance_path):
        os.makedirs(app.instance_path)
    
    with app.app_context():
        db.create_all()
        
        print("데이터베이스가 성공적으로 초기화되었습니다.")

init_db()

@app.route('/')
def index():
    # 최신 시공사진 6개 가져오기
    latest_construction = Construction.query.order_by(Construction.created_at.desc()).limit(6).all()
    return render_template('index.html', latest_construction=latest_construction)

@app.route('/submit_estimate', methods=['POST'])
def submit_estimate():
    if not supabase:
        flash('Supabase 연결이 설정되지 않았습니다.', 'error')
        return redirect(url_for('index', _anchor='estimate'))
    
    try:
        data = request.form
        
        # 필수 필드 확인
        required_fields = ['name', 'phone', 'service_type', 'content']
        for field in required_fields:
            if not data.get(field):
                flash(f'{field} 필드는 필수입니다.', 'error')
                return redirect(url_for('index', _anchor='estimate'))

        # Supabase에 데이터 저장
        estimate_data = {
            'title': f"{data['service_type']} 견적문의",
            'name': data['name'],
            'phone': data['phone'],
            'service_type': data['service_type'],
            'content': data['content'],
            'status': '대기중',
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'unknown')
        }

        result = supabase.table('estimates').insert(estimate_data).execute()
        
        if result.data:
            flash('견적문의가 성공적으로 등록되었습니다.', 'success')
            return redirect(url_for('board'))
        else:
            flash('견적문의 등록 중 오류가 발생했습니다.', 'error')
            return redirect(url_for('index', _anchor='estimate'))

    except Exception as e:
        flash(f'견적문의 등록 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('index', _anchor='estimate'))

def mask_name(name):
    if not name:
        return ''
    if len(name) <= 2:
        return name[0] + '*'
    return name[0] + '*' * (len(name) - 2) + name[-1]

def mask_phone(phone):
    if not phone:
        return ''
    cleaned = ''.join(filter(str.isdigit, phone))
    if len(cleaned) <= 4:
        return phone
    return cleaned[:4] + '-****-' + cleaned[-4:]

@app.route('/board')
def board():
    if not supabase:
        flash('Supabase 연결이 설정되지 않았습니다.', 'error')
        return render_template('board.html', estimates=None)
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = 10
        from_range = (page - 1) * per_page
        to_range = from_range + per_page - 1

        # Supabase에서 견적문의 목록 가져오기
        result = supabase.table('estimates')\
            .select('*')\
            .order('created_at', desc=True)\
            .range(from_range, to_range)\
            .execute()

        estimates = result.data if result.data else []
        
        # 개인정보 마스킹
        for estimate in estimates:
            estimate['name'] = mask_name(estimate['name'])
            estimate['phone'] = mask_phone(estimate['phone'])

        # 페이지네이션 정보 (간단한 구현)
        total_count = len(estimates)  # 실제로는 count 쿼리 필요
        total_pages = (total_count + per_page - 1) // per_page

        return render_template('board.html', estimates=estimates, 
                            page=page, total_pages=total_pages)
    
    except Exception as e:
        flash(f'견적문의 목록을 불러오는 중 오류가 발생했습니다: {str(e)}', 'error')
        return render_template('board.html', estimates=[])

@app.route('/view/<int:id>')
def view(id):
    if not supabase:
        flash('Supabase 연결이 설정되지 않았습니다.', 'error')
        return redirect(url_for('board'))
    
    try:
        # Supabase에서 특정 견적문의 가져오기
        result = supabase.table('estimates')\
            .select('*')\
            .eq('id', id)\
            .single()\
            .execute()

        if result.data:
            estimate = result.data
            # 개인정보 마스킹
            estimate['name'] = mask_name(estimate['name'])
            estimate['phone'] = mask_phone(estimate['phone'])
            return render_template('view.html', estimate=estimate)
        else:
            flash('견적문의를 찾을 수 없습니다.', 'error')
            return redirect(url_for('board'))
    
    except Exception as e:
        flash(f'견적문의를 불러오는 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('board'))

@app.route('/api/estimates', methods=['GET'])
def get_estimates():
    if not supabase:
        return jsonify({'error': 'Supabase 연결이 설정되지 않았습니다.'}), 500
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        from_range = (page - 1) * per_page
        to_range = from_range + per_page - 1

        # Supabase에서 견적문의 목록 가져오기
        result = supabase.table('estimates')\
            .select('*')\
            .order('created_at', desc=True)\
            .range(from_range, to_range)\
            .execute()

        estimates = result.data if result.data else []
        
        # 개인정보 마스킹
        for estimate in estimates:
            estimate['name'] = mask_name(estimate['name'])
            estimate['phone'] = mask_phone(estimate['phone'])

        return jsonify({
            'estimates': estimates,
            'page': page,
            'per_page': per_page,
            'total': len(estimates)
        })
    
    except Exception as e:
        return jsonify({'error': f'견적문의 목록을 불러오는 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/api/estimates/<int:id>', methods=['GET'])
def get_estimate(id):
    if not supabase:
        return jsonify({'error': 'Supabase 연결이 설정되지 않았습니다.'}), 500
    
    try:
        result = supabase.table('estimates')\
            .select('*')\
            .eq('id', id)\
            .single()\
            .execute()

        if result.data:
            estimate = result.data
            # 개인정보 마스킹
            estimate['name'] = mask_name(estimate['name'])
            estimate['phone'] = mask_phone(estimate['phone'])
            return jsonify(estimate)
        else:
            return jsonify({'error': '견적문의를 찾을 수 없습니다.'}), 404
    
    except Exception as e:
        return jsonify({'error': f'견적문의를 불러오는 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/api/estimates/<int:id>', methods=['DELETE'])
def delete_estimate(id):
    if not supabase:
        return jsonify({'error': 'Supabase 연결이 설정되지 않았습니다.'}), 500
    
    try:
        result = supabase.table('estimates')\
            .delete()\
            .eq('id', id)\
            .execute()

        if result.data:
            return jsonify({'success': True, 'message': '견적문의가 성공적으로 삭제되었습니다.'})
        else:
            return jsonify({'error': '삭제할 견적문의를 찾을 수 없습니다.'}), 404
    
    except Exception as e:
        return jsonify({'error': f'견적문의 삭제 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/construction')
def construction_board():
    posts = Construction.query.order_by(Construction.created_at.desc()).all()
    return render_template('construction.html', posts=posts)

@app.route('/construction/new', methods=['GET', 'POST'])
def new_construction():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        image = request.files.get('image')
        
        image_path = None
        if image and image.filename:
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.filename}"
            image_path = os.path.join('uploads', filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        post = Construction(title=title, content=content, image_path=image_path)
        db.session.add(post)
        db.session.commit()
        
        flash('게시글이 성공적으로 작성되었습니다.', 'success')
        return redirect(url_for('construction_board'))
    
    return render_template('construction_form.html')

@app.route('/construction/<int:id>/edit', methods=['GET', 'POST'])
def edit_construction(id):
    post = Construction.query.get_or_404(id)
    
    if request.method == 'POST':
        post.title = request.form['title']
        post.content = request.form['content']
        
        image = request.files.get('image')
        if image and image.filename:
            # 기존 이미지 삭제
            if post.image_path:
                old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(post.image_path))
                if os.path.exists(old_image_path):
                    os.remove(old_image_path)
            
            # 새 이미지 저장
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.filename}"
            post.image_path = os.path.join('uploads', filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        db.session.commit()
        flash('게시글이 성공적으로 수정되었습니다.', 'success')
        return redirect(url_for('construction_board'))
    
    return render_template('construction_edit.html', post=post)

@app.route('/construction/<int:id>/delete')
def delete_construction(id):
    post = Construction.query.get_or_404(id)
    
    # 이미지 파일 삭제
    if post.image_path:
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(post.image_path))
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.session.delete(post)
    db.session.commit()
    flash('게시글이 성공적으로 삭제되었습니다.', 'success')
    return redirect(url_for('construction_board'))

if __name__ == '__main__':
    # uploads 폴더가 없으면 생성
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(host='0.0.0.0', port=8080, debug=True) 