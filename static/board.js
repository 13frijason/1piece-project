// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 페이지 로드 시 견적문의 목록 로드
document.addEventListener('DOMContentLoaded', function() {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const customerName = urlParams.get('customer-name');
    const customerPhone = urlParams.get('customer-phone');
    const serviceType = urlParams.get('service-type');
    const detailedRequest = urlParams.get('detailed-request');
    
    // 폼 데이터가 있으면 자동으로 견적문의 생성
    if (customerName && customerPhone && serviceType && detailedRequest) {
        createEstimateFromForm(customerName, customerPhone, serviceType, detailedRequest);
    } else {
        loadEstimates();
    }
});

// 견적문의 목록 로드 함수
async function loadEstimates() {
    try {
        const { data: estimates, error } = await supabaseClient
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

// 폼 데이터로부터 견적문의 생성 함수
async function createEstimateFromForm(customerName, customerPhone, serviceType, detailedRequest) {
    try {
        // 서비스 타입에 따른 제목 생성
        const serviceTypeMap = {
            'aircon': '에어컨 설치',
            'hvac': '냉난방 시스템',
            'ventilation': '환기 시스템',
            'maintenance': '정기 점검',
            'other': '기타'
        };
        
        const title = `${serviceTypeMap[serviceType] || '견적문의'} - ${customerName}`;
        
        // 견적문의 데이터 생성
        const estimateData = {
            title: title,
            name: customerName,
            phone: customerPhone,
            content: `서비스 종류: ${serviceTypeMap[serviceType] || serviceType}\n\n상세 요청사항:\n${detailedRequest}`,
            status: '대기중'
        };
        
        // Supabase에 견적문의 저장
        const { data, error } = await supabaseClient
            .from('estimates')
            .insert([estimateData]);
            
        if (error) {
            console.error('견적문의 생성 오류:', error);
            showMessage('견적문의 생성에 실패했습니다.', 'error');
            loadEstimates(); // 기존 목록 로드
            return;
        }
        
        showMessage('견적문의가 성공적으로 등록되었습니다!', 'success');
        
        // URL 파라미터 제거하고 목록 새로고침
        window.history.replaceState({}, document.title, window.location.pathname);
        loadEstimates();
        
    } catch (error) {
        console.error('견적문의 생성 오류:', error);
        showMessage('견적문의 생성에 실패했습니다.', 'error');
        loadEstimates(); // 기존 목록 로드
    }
}

// 견적문의 삭제 함수
async function deleteEstimate(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
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