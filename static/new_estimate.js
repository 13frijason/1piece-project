// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 실제 Supabase URL로 변경 필요
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 실제 Supabase Anon Key로 변경 필요

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