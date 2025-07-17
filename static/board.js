// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 실제 Supabase URL로 변경 필요
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 실제 Supabase Anon Key로 변경 필요

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 페이지 로드 시 견적문의 목록 로드
document.addEventListener('DOMContentLoaded', function() {
    loadEstimates();
});

// 견적문의 목록 로드 함수
async function loadEstimates() {
    try {
        const { data: estimates, error } = await supabase
            .from('estimates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('견적문의 로드 오류:', error);
            showMessage('견적문의를 불러오는데 실패했습니다.', 'error');
            return;
        }

        displayEstimates(estimates);
    } catch (error) {
        console.error('견적문의 로드 오류:', error);
        showMessage('견적문의를 불러오는데 실패했습니다.', 'error');
    }
}

// 견적문의 목록 표시 함수
function displayEstimates(estimates) {
    const estimatesList = document.getElementById('estimates-list');
    const noEstimates = document.getElementById('no-estimates');

    if (!estimates || estimates.length === 0) {
        estimatesList.style.display = 'none';
        noEstimates.style.display = 'block';
        return;
    }

    estimatesList.style.display = 'block';
    noEstimates.style.display = 'none';

    estimatesList.innerHTML = estimates.map(estimate => `
        <div class="estimate-item" data-id="${estimate.id}">
            <div class="estimate-header">
                <h3 class="estimate-title">${estimate.title}</h3>
                <span class="estimate-date">${formatDate(estimate.created_at)}</span>
            </div>
            <div class="estimate-info">
                <p class="estimate-name">작성자: <span class="name-text">${estimate.name}</span></p>
                <p class="estimate-phone">연락처: <span class="phone-text">${estimate.phone}</span></p>
                <p class="estimate-status">상태: <span class="status-${estimate.status.toLowerCase()}">${estimate.status}</span></p>
            </div>
            <div class="estimate-content">
                <p>${estimate.content.length > 100 ? estimate.content.substring(0, 100) + '...' : estimate.content}</p>
            </div>
            <div class="estimate-actions">
                <a href="view_estimate.html?id=${estimate.id}" class="view-button">상세보기</a>
                <button onclick="deleteEstimate(${estimate.id})" class="delete-button">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 날짜 포맷 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
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

// 견적문의 삭제 함수
async function deleteEstimate(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('estimates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('견적문의 삭제 오류:', error);
            showMessage('견적문의 삭제에 실패했습니다.', 'error');
            return;
        }

        showMessage('견적문의가 삭제되었습니다.', 'success');
        loadEstimates(); // 목록 새로고침
    } catch (error) {
        console.error('견적문의 삭제 오류:', error);
        showMessage('견적문의 삭제에 실패했습니다.', 'error');
    }
} 