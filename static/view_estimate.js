// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

// Supabase 클라이언트 초기화 (js/supabase.js에서 가져온 설정 사용)
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.error('Supabase 클라이언트 초기화 실패:', error);
    // fallback 객체 생성
    supabaseClient = {
        from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: null, error: 'Supabase 연결 실패' }),
            delete: () => Promise.resolve({ data: null, error: 'Supabase 연결 실패' })
        })
    };
}

// 페이지 로드 시 견적문의 상세 정보 로드
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const estimateId = urlParams.get('id');
    
    if (estimateId) {
        loadEstimateDetail(estimateId);
    } else {
        showError('견적문의 ID가 없습니다.');
    }
});

// 견적문의 상세 정보 로드 함수
async function loadEstimateDetail(id) {
    try {
        const { data: estimate, error } = await supabaseClient
            .from('estimates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('견적문의 로드 오류:', error);
            showError('견적문의를 불러오는데 실패했습니다.');
            return;
        }

        if (!estimate) {
            showError('견적문의를 찾을 수 없습니다.');
            return;
        }

        displayEstimateDetail(estimate);
    } catch (error) {
        console.error('견적문의 로드 오류:', error);
        showError('견적문의를 불러오는데 실패했습니다.');
    }
}

// 견적문의 상세 정보 표시 함수
function displayEstimateDetail(estimate) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('estimate-detail').style.display = 'block';
    
    document.getElementById('estimate-title').textContent = estimate.title;
    document.getElementById('estimate-name').textContent = estimate.name;
    document.getElementById('estimate-phone').textContent = estimate.phone;
    document.getElementById('estimate-status').textContent = estimate.status;
    document.getElementById('estimate-status').className = `status-badge status-${estimate.status.toLowerCase()}`;
    document.getElementById('estimate-date').textContent = formatDate(estimate.created_at);
    document.getElementById('estimate-content').textContent = estimate.content;
}

// 날짜 포맷 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 오류 메시지 표시 함수
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('error-message').innerHTML = `<p>${message}</p>`;
} 