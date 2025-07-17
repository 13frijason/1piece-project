// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 폼 제출 이벤트 처리
document.addEventListener('DOMContentLoaded', function() {
    const estimateForm = document.getElementById('estimate-form');
    
    if (estimateForm) {
        estimateForm.addEventListener('submit', handleSubmit);
    }
});

// 폼 제출 처리 함수
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const estimateData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        title: formData.get('title'),
        content: formData.get('content'),
        status: '대기중', // 기본 상태
        created_at: new Date().toISOString()
    };
    
    // 필수 필드 검증
    if (!estimateData.name || !estimateData.phone || !estimateData.title || !estimateData.content) {
        showMessage('모든 필수 항목을 입력해주세요.', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('estimates')
            .insert([estimateData])
            .select();
        
        if (error) {
            console.error('견적문의 등록 오류:', error);
            showMessage('견적문의 등록에 실패했습니다.', 'error');
            return;
        }
        
        showMessage('견적문의가 성공적으로 등록되었습니다.', 'success');
        
        // 폼 초기화
        e.target.reset();
        
        // 2초 후 게시판으로 이동
        setTimeout(() => {
            window.location.href = 'board.html';
        }, 2000);
        
    } catch (error) {
        console.error('견적문의 등록 오류:', error);
        showMessage('견적문의 등록에 실패했습니다.', 'error');
    }
}

// 메시지 표시 함수
function showMessage(message, type = 'success') {
    const flashMessages = document.getElementById('flash-messages');
    flashMessages.innerHTML = `
        <div class="flash-message flash-${type}">
            ${message}
        </div>
    `;
    flashMessages.style.display = 'block';
    
    // 3초 후 메시지 숨기기
    setTimeout(() => {
        flashMessages.style.display = 'none';
    }, 3000);
} 