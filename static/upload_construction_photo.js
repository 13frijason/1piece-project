// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    setupFormHandlers();
    setupImagePreview();
});

// 폼 핸들러 설정
function setupFormHandlers() {
    const uploadForm = document.getElementById('upload-form');
    
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
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