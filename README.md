# 원피스공조 웹사이트 - 관리자 로그인 기능

## 개요
원피스공조 웹사이트에 관리자 로그인 기능이 추가되었습니다. 관리자만 시공사진을 업로드하고 견적문의를 관리할 수 있습니다.

## 주요 기능

### 1. 관리자 로그인
- 관리자 전용 로그인 모달
- 이메일/비밀번호 인증
- 로그인 상태 유지 (localStorage)

### 2. 관리자 권한
- 시공사진 업로드/관리
- 견적문의 수정/삭제
- 사이트 설정 (향후 구현 예정)

### 3. 보안 기능
- 관리자 권한 확인
- 비관리자 접근 차단
- 로그아웃 기능

## 설정 방법

### 1. Supabase 설정

#### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 확인

#### 1.2 데이터베이스 테이블 생성

**estimates 테이블 (견적문의)**
```sql
CREATE TABLE estimates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT '대기중',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**construction_photos 테이블 (시공사진)**
```sql
CREATE TABLE construction_photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT '일반',
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Storage 버킷 생성
1. Supabase 대시보드에서 Storage 메뉴로 이동
2. `construction-photos` 버킷 생성
3. Public 권한 설정

#### 1.4 관리자 계정 생성
1. Authentication > Users에서 관리자 계정 생성
2. 이메일: `admin@admin.local` (내부적으로 아이디 'admin'으로 변환됨)
3. 비밀번호: `dnjsvltm1!`

**또는 SQL로 생성:**
```sql
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    'admin@admin.local',
    crypt('dnjsvltm1!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
);
```

### 2. 코드 설정

#### 2.1 Supabase 연결 설정
`js/supabase.js` 파일에서 Supabase URL과 API 키를 설정:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

#### 2.2 관리자 아이디 설정
`js/supabase.js` 파일에서 관리자 아이디를 확인:

```javascript
function isAdmin() {
    return currentUser && (currentUser.username === 'admin' || currentUser.email === 'admin@admin.local');
}
```

### 3. 배포 설정

#### 3.1 Netlify 배포
1. GitHub 저장소와 Netlify 연결
2. 빌드 설정:
   - Build command: 없음 (정적 사이트)
   - Publish directory: `.` (루트 디렉토리)

#### 3.2 환경 변수 설정 (선택사항)
Netlify에서 환경 변수 설정:
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase 익명 API 키

## 사용 방법

### 1. 관리자 로그인
1. 메인 페이지에서 "관리자" 버튼 클릭
2. 로그인 모달에서 아이디/비밀번호 입력
3. 로그인 성공 시 관리자 패널 표시

### 2. 시공사진 업로드
1. 관리자로 로그인
2. 관리자 패널에서 "시공사진 업로드" 클릭
3. 사진 제목, 설명, 파일 선택
4. 업로드 완료

### 3. 견적문의 관리
1. 관리자로 로그인
2. 견적문의 게시판에서 "수정" 또는 "삭제" 버튼 클릭
3. 상태 변경 또는 삭제

## 파일 구조

```
원피스 프로젝트/
├── index.html              # 메인 페이지 (로그인 모달 포함)
├── board.html              # 견적문의 게시판 (관리자 기능 포함)
├── upload_construction_photo.html  # 시공사진 업로드 (관리자 전용)
├── js/
│   └── supabase.js        # Supabase 설정 및 로그인 기능
├── static/
│   ├── styles.css         # CSS 스타일 (로그인 관련 스타일 포함)
│   ├── script.js          # JavaScript (모달 기능)
│   ├── board.js           # 견적문의 게시판 기능
│   └── upload_construction_photo.js  # 업로드 기능 (관리자 권한 확인)
└── README.md              # 이 파일
```

## 보안 고려사항

### 1. 클라이언트 사이드 보안
- 현재 구현은 클라이언트 사이드에서 권한 확인
- 실제 운영에서는 서버 사이드 검증 필요

### 2. API 키 보안
- Supabase 익명 키는 공개되어도 안전
- 서비스 롤 키는 절대 클라이언트에 노출하지 않음

### 3. 추가 보안 권장사항
- Row Level Security (RLS) 활성화
- Supabase 정책 설정으로 서버 사이드 보안 강화
- 정기적인 비밀번호 변경

## 문제 해결

### 1. 로그인이 안 되는 경우
- Supabase 프로젝트 URL과 API 키 확인
- 관리자 계정이 올바르게 생성되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 2. 업로드가 안 되는 경우
- Supabase Storage 버킷 권한 확인
- 파일 크기 제한 확인 (16MB)
- 이미지 파일 형식 확인

### 3. 관리자 권한이 인식되지 않는 경우
- 로그인 후 페이지 새로고침
- 브라우저 캐시 삭제
- localStorage 확인

## 향후 개선 사항

1. **서버 사이드 보안 강화**
   - Row Level Security (RLS) 구현
   - 서버 사이드 권한 검증

2. **사용자 관리 기능**
   - 다중 관리자 계정 지원
   - 권한 레벨 설정

3. **추가 관리 기능**
   - 사이트 설정 페이지
   - 통계 대시보드
   - 백업/복원 기능

## 문의 및 지원

문제가 발생하거나 추가 기능이 필요한 경우:
- 이메일: isari242@naver.com
- 전화: 010-9493-3854

---

**주의**: 이 문서는 개발자를 위한 설정 가이드입니다. 실제 운영 시에는 보안을 강화하고 정기적인 업데이트를 권장합니다. 