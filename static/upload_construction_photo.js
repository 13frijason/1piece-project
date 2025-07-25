// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 로그인 상태 관리
let currentUser = null;

// 사용자 권한 확인 함수
function isAdmin() {
    return currentUser && (currentUser.username === 'admin' || currentUser.email === 'admin@admin.local');
}

// UI 업데이트 함수들
function updateUIForLoggedInUser() {
    const accessDenied = document.getElementById('access-denied');
    const adminUploadForm = document.getElementById('admin-upload-form');
    
    if (accessDenied) accessDenied.style.display = 'none';
    if (adminUploadForm && isAdmin()) adminUploadForm.style.display = 'block';
}

function updateUIForLoggedOutUser() {
    const accessDenied = document.getElementById('access-denied');
    const adminUploadForm = document.getElementById('admin-upload-form');
    
    if (accessDenied) accessDenied.style.display = 'block';
    if (adminUploadForm) adminUploadForm.style.display = 'none';
}

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', async function() {
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
    
    // 관리자 권한이 있는 경우에만 폼 핸들러 설정
    if (isAdmin()) {
        setupFormHandlers();
        setupImagePreview();
    }
    
    // 로그인 폼 이벤트 리스너
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = await loginUser(username, password);
            if (result.success) {
                if (isAdmin()) {
                    alert('관리자 모드로 로그인되었습니다!');
                } else {
                    alert('로그인 성공!');
                }
                updateUIForLoggedInUser();
                setupFormHandlers();
                setupImagePreview();
            } else {
                alert('로그인 실패: ' + result.error);
            }
        });
    }
    
    // 로그아웃 버튼 이벤트 리스너
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const result = await logoutUser();
            if (result.success) {
                alert('로그아웃 되었습니다.');
                updateUIForLoggedOutUser();
            }
        });
    }
    
    // 관리자 로그인 버튼 이벤트 리스너
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.querySelector('#login-modal .close-modal');
    
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'block';
        });
    }
    
    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
        });
    }
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
});

// 로그인 함수 (아이디 기반)
async function loginUser(username, password) {
    try {
        // 아이디를 이메일 형식으로 변환 (Supabase는 이메일을 요구함)
        const email = username + '@admin.local';
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        currentUser = data.user;
        // 사용자 정보에 아이디 추가
        currentUser.username = username;
        localStorage.setItem('user', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// 로그아웃 함수
async function logoutUser() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        localStorage.removeItem('user');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// 폼 핸들러 설정
function setupFormHandlers() {
    const uploadForm = document.getElementById('upload-form');
    
    if (!uploadForm) return;
    
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 관리자 권한 재확인
        if (!isAdmin()) {
            showMessage('관리자만 업로드할 수 있습니다.', 'error');
            return;
        }
        
        const formData = new FormData(uploadForm);
        const title = formData.get('title');
        const description = formData.get('description');
        // const category = formData.get('category'); // 나중에 카테고리 필터 활성화 시 사용
        const photoFile = formData.get('photo');
        
        if (!title || !photoFile) {
            showMessage('제목과 사진 파일은 필수입니다.', 'error');
            return;
        }
        
        await uploadPhoto(title, description, photoFile);
    });
}

// 이미지 미리보기 설정
function setupImagePreview() {
    const photoInput = document.getElementById('photo');
    const previewDiv = document.getElementById('upload-preview');
    
    if (!photoInput || !previewDiv) return;
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 파일 크기 확인 (16MB)
            if (file.size > 16 * 1024 * 1024) {
                showMessage('파일 크기는 16MB 이하여야 합니다.', 'error');
                photoInput.value = '';
                previewDiv.style.display = 'none';
                return;
            }
            
            // 파일 형식 확인
            if (!file.type.startsWith('image/')) {
                showMessage('이미지 파일만 업로드 가능합니다.', 'error');
                photoInput.value = '';
                previewDiv.style.display = 'none';
                return;
            }
            
            // 미리보기 표시
            const reader = new FileReader();
            reader.onload = function(e) {
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="미리보기">`;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewDiv.style.display = 'none';
        }
    });
}

// 사진 업로드 함수
async function uploadPhoto(title, description, photoFile) {
    try {
        showMessage('업로드 중입니다...', 'success');
        
        // 파일명 생성 (타임스탬프 + 원본 파일명)
        const timestamp = new Date().getTime();
        const fileExtension = photoFile.name.split('.').pop();
        const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Supabase Storage에 파일 업로드
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('construction-photos')
            .upload(fileName, photoFile);
        
        if (uploadError) {
            console.error('파일 업로드 오류:', uploadError);
            showMessage('파일 업로드에 실패했습니다.', 'error');
            return;
        }
        
        // 업로드된 파일의 공개 URL 가져오기
        const { data: urlData } = supabaseClient.storage
            .from('construction-photos')
            .getPublicUrl(fileName);
        
        // 데이터베이스에 사진 정보 저장
        const photoData = {
            title: title,
            description: description || '',
            category: '일반', // 기본 카테고리로 설정 (나중에 카테고리 필터 활성화 시 변경)
            image_url: urlData.publicUrl,
            is_active: true
        };
        
        const { data: insertData, error: insertError } = await supabaseClient
            .from('construction_photos')
            .insert([photoData]);
        
        if (insertError) {
            console.error('데이터베이스 저장 오류:', insertError);
            showMessage('사진 정보 저장에 실패했습니다.', 'error');
            return;
        }
        
        showMessage('시공사진이 성공적으로 업로드되었습니다!', 'success');
        
        // 폼 초기화
        document.getElementById('upload-form').reset();
        document.getElementById('upload-preview').style.display = 'none';
        
        // 2초 후 게시판으로 이동
        setTimeout(() => {
            window.location.href = 'construction_photos.html';
        }, 2000);
        
    } catch (error) {
        console.error('업로드 오류:', error);
        showMessage('업로드 중 오류가 발생했습니다.', 'error');
    }
}

// 메시지 표시 함수
function showMessage(message, type = 'success') {
    const flashMessages = document.getElementById('flash-messages');
    if (!flashMessages) return;
    
    flashMessages.innerHTML = `
        <div class="flash-message flash-${type}">
            ${message}
        </div>
    `;
    flashMessages.style.display = 'block';
    
    // 성공 메시지는 3초 후, 오류 메시지는 5초 후 숨기기
    const hideTime = type === 'success' ? 3000 : 5000;
    setTimeout(() => {
        flashMessages.style.display = 'none';
    }, hideTime);
} 