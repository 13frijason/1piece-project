// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 현재 선택된 카테고리 (나중에 카테고리 필터 활성화 시 사용)
// let currentCategory = '';

// 페이지 로드 시 시공사진 목록 로드
document.addEventListener('DOMContentLoaded', function() {
    loadConstructionPhotos();
    // setupCategoryFilter(); // 나중에 카테고리 필터 활성화 시 사용
});

// 시공사진 목록 로드 함수
async function loadConstructionPhotos() {
    try {
        let query = supabaseClient
            .from('construction_photos')
            .select('*')
            .order('created_at', { ascending: false });

        // 카테고리 필터 적용 (나중에 활성화 시 사용)
        // if (currentCategory) {
        //     query = query.eq('category', currentCategory);
        // }

        const { data: photos, error } = await query;

        if (error) {
            console.error('시공사진 로드 오류:', error);
            showMessage('시공사진을 불러오는데 실패했습니다.', 'error');
            return;
        }

        displayPhotos(photos);
    } catch (error) {
        console.error('시공사진 로드 오류:', error);
        showMessage('시공사진을 불러오는데 실패했습니다.', 'error');
    }
}

// 시공사진 목록 표시 함수
function displayPhotos(photos) {
    const photosGrid = document.getElementById('photos-grid');
    const noPhotos = document.getElementById('no-photos');

    if (!photos || photos.length === 0) {
        photosGrid.style.display = 'none';
        noPhotos.style.display = 'block';
        return;
    }

    photosGrid.style.display = 'grid';
    noPhotos.style.display = 'none';

    photosGrid.innerHTML = photos.map(photo => `
        <div class="photo-card" data-id="${photo.id}">
            <div class="photo-image">
                <img src="${photo.image_url}" alt="${photo.title}">
                <div class="photo-overlay">
                    <div class="photo-actions">
                        <button onclick="togglePhotoStatus(${photo.id}, ${photo.is_active})" class="action-btn ${photo.is_active ? 'active' : 'inactive'}">
                            <i class="fas fa-eye"></i>
                            ${photo.is_active ? '활성화' : '비활성화'}
                        </button>
                        <button onclick="deletePhoto(${photo.id})" class="action-btn delete">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </div>
            </div>
            <div class="photo-info">
                <h3>${photo.title}</h3>
                ${photo.description ? `<p>${photo.description}</p>` : ''}
                <div class="photo-meta">
                    <span class="category">${photo.category}</span>
                    <span class="date">${formatDate(photo.created_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 카테고리 필터 설정 (나중에 활성화 시 사용)
/*
function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 모든 버튼에서 active 클래스 제거
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 카테고리 설정
            currentCategory = this.getAttribute('data-category');
            
            // 사진 목록 다시 로드
            loadConstructionPhotos();
        });
    });
}
*/

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

// 사진 상태 토글 함수
async function togglePhotoStatus(id, currentStatus) {
    try {
        const { error } = await supabaseClient
            .from('construction_photos')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('사진 상태 변경 오류:', error);
            showMessage('사진 상태 변경에 실패했습니다.', 'error');
            return;
        }

        const status = !currentStatus ? '활성화' : '비활성화';
        showMessage(`사진이 ${status}되었습니다.`, 'success');
        loadConstructionPhotos(); // 목록 새로고침
    } catch (error) {
        console.error('사진 상태 변경 오류:', error);
        showMessage('사진 상태 변경에 실패했습니다.', 'error');
    }
}

// 사진 삭제 함수
async function deletePhoto(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('construction_photos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('사진 삭제 오류:', error);
            showMessage('사진 삭제에 실패했습니다.', 'error');
            return;
        }

        showMessage('사진이 삭제되었습니다.', 'success');
        loadConstructionPhotos(); // 목록 새로고침
    } catch (error) {
        console.error('사진 삭제 오류:', error);
        showMessage('사진 삭제에 실패했습니다.', 'error');
    }
} 