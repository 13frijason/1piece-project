// Supabase 연결 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

// Supabase 클라이언트 생성
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 로그인 상태 관리
let currentUser = null;

// 로그인 함수 (아이디 기반)
async function loginUser(username, password) {
    try {
        // 아이디를 이메일 형식으로 변환 (Supabase는 이메일을 요구함)
        const email = username + '@admin.local';
        
        const { data, error } = await supabase.auth.signInWithPassword({
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
        updateUIForLoggedInUser();
        return { success: true, user: currentUser };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// 로그아웃 함수
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        localStorage.removeItem('user');
        updateUIForLoggedOutUser();
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// 사용자 권한 확인 함수
function isAdmin() {
    return currentUser && (currentUser.username === 'admin' || currentUser.email === 'admin@admin.local');
}

// UI 업데이트 함수들
function updateUIForLoggedInUser() {
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    
    if (loginForm) loginForm.style.display = 'none';
    if (adminPanel && isAdmin()) adminPanel.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    // 관리자 로그인 버튼 텍스트 변경
    if (adminLoginBtn && isAdmin()) {
        adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> 관리자 모드';
        adminLoginBtn.classList.add('admin-mode');
    }
    
    // 관리자 권한이 있는 경우 시공사진 관리 버튼 표시
    if (isAdmin()) {
        showAdminControls();
    }
}

function updateUIForLoggedOutUser() {
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    
    if (loginForm) loginForm.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    // 관리자 로그인 버튼 텍스트 원래대로 복원
    if (adminLoginBtn) {
        adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> 관리자';
        adminLoginBtn.classList.remove('admin-mode');
    }
    
    hideAdminControls();
}

// 관리자 컨트롤 표시/숨김
function showAdminControls() {
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => btn.style.display = 'inline-block');
}

function hideAdminControls() {
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => btn.style.display = 'none');
}

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', async function() {
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
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
            }
        });
    }
});

// 견적문의 폼 제출 처리
document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(quoteForm);
            const estimateData = {
                name: formData.get('customer-name'),
                phone: formData.get('customer-phone'),
                title: formData.get('service-type'),
                content: formData.get('detailed-request'),
                status: '대기중'
            };
            
            try {
                const { data, error } = await supabase
                    .from('estimates')
                    .insert([estimateData]);
                
                if (error) {
                    console.error('Error:', error);
                    alert('견적문의 등록에 실패했습니다. 다시 시도해주세요.');
                } else {
                    alert('견적문의가 성공적으로 등록되었습니다!');
                    quoteForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('견적문의 등록에 실패했습니다. 다시 시도해주세요.');
            }
        });
    }
});

// 게시판 목록 불러오기 함수
async function loadEstimates() {
    try {
        const { data: estimates, error } = await supabase
            .from('estimates')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error:', error);
            return [];
        }
        
        return estimates || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// 게시판 HTML 렌더링 함수
function renderEstimates(estimates) {
    const boardList = document.getElementById('board-list');
    if (!boardList) return;
    
    if (estimates.length === 0) {
        boardList.innerHTML = '<p>등록된 견적문의가 없습니다.</p>';
        return;
    }
    
    const estimatesHTML = estimates.map(estimate => `
        <div class="estimate-item" data-id="${estimate.id}">
            <div class="estimate-header">
                <h3>${estimate.name}</h3>
                <span class="estimate-date">${new Date(estimate.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div class="estimate-content">
                <p><strong>서비스:</strong> ${estimate.title}</p>
                <p><strong>연락처:</strong> ${estimate.phone}</p>
                <p><strong>상세내용:</strong></p>
                <p>${estimate.content}</p>
                <p><strong>상태:</strong> ${estimate.status}</p>
                ${isAdmin() ? `
                    <div class="admin-controls">
                        <button onclick="editEstimate(${estimate.id})" class="admin-only">수정</button>
                        <button onclick="deleteEstimate(${estimate.id})" class="admin-only">삭제</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    boardList.innerHTML = estimatesHTML;
}

// 견적문의 수정 함수
async function editEstimate(id) {
    if (!isAdmin()) {
        alert('관리자만 수정할 수 있습니다.');
        return;
    }
    
    // 수정 폼 표시 로직
    const newStatus = prompt('상태를 변경하세요 (대기중/처리중/완료):');
    if (newStatus) {
        try {
            const { error } = await supabase
                .from('estimates')
                .update({ status: newStatus })
                .eq('id', id);
            
            if (error) {
                alert('수정에 실패했습니다.');
            } else {
                alert('수정되었습니다.');
                const estimates = await loadEstimates();
                renderEstimates(estimates);
            }
        } catch (error) {
            alert('수정에 실패했습니다.');
        }
    }
}

// 견적문의 삭제 함수
async function deleteEstimate(id) {
    if (!isAdmin()) {
        alert('관리자만 삭제할 수 있습니다.');
        return;
    }
    
    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            const { error } = await supabase
                .from('estimates')
                .delete()
                .eq('id', id);
            
            if (error) {
                alert('삭제에 실패했습니다.');
            } else {
                alert('삭제되었습니다.');
                // 삭제된 항목을 DOM에서 제거
                const estimateItem = document.querySelector(`[data-id="${id}"]`);
                if (estimateItem) {
                    estimateItem.remove();
                }
                // 목록 다시 로드
                const estimates = await loadEstimates();
                renderEstimates(estimates);
            }
        } catch (error) {
            alert('삭제에 실패했습니다.');
        }
    }
}

// 페이지 로드 시 게시판 목록 불러오기
document.addEventListener('DOMContentLoaded', async function() {
    const estimates = await loadEstimates();
    renderEstimates(estimates);
});

// 실시간 업데이트 (선택사항)
// Supabase의 실시간 구독 기능을 사용하려면 아래 코드를 활성화하세요
/*
supabase
    .channel('estimates')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'estimates' }, 
        async (payload) => {
            console.log('Change received!', payload);
            const estimates = await loadEstimates();
            renderEstimates(estimates);
        }
    )
    .subscribe();
*/ 