// 관리자 권한 확인 함수
function isAdmin() {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    return adminLoggedIn && adminInfo.username === 'admin';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드됨');
    
    // 관리자 권한이 있는 경우에만 폼 핸들러 설정
    if (isAdmin()) {
        console.log('관리자 권한 확인됨, 폼 핸들러 설정');
        setupFormHandlers();
        setupImagePreview();
    } else {
        console.log('관리자 권한 없음');
    }
});

// 폼 핸들러 설정
function setupFormHandlers() {
    const uploadForm = document.getElementById('upload-form');
    
    if (!uploadForm) {
        console.error('업로드 폼을 찾을 수 없습니다.');
        return;
    }
    
    console.log('폼 핸들러 설정됨');
    
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('폼 제출됨');
        
        // 관리자 권한 재확인
        if (!isAdmin()) {
            showMessage('관리자만 업로드할 수 있습니다.', 'error');
            return;
        }
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const photoFile = document.getElementById('photo').files[0];
        
        console.log('폼 데이터:', { title, description, photoFile: photoFile ? photoFile.name : '없음' });
        
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
    
    if (!photoInput || !previewDiv) {
        console.error('이미지 미리보기 요소를 찾을 수 없습니다.');
        return;
    }
    
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

// 사진 업로드 함수 (재시도 로직 포함)
async function uploadPhoto(title, description, photoFile) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`업로드 시도 ${retryCount + 1}/${maxRetries}:`, { title, description, fileName: photoFile.name });
            showMessage(`업로드 중입니다... (시도 ${retryCount + 1}/${maxRetries})`, 'success');
            
            // 파일명 생성 (타임스탬프 + 원본 파일명)
            const timestamp = new Date().getTime();
            const fileExtension = photoFile.name.split('.').pop();
            const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
            
            console.log('생성된 파일명:', fileName);
            
            // Supabase Storage에 파일 업로드
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('construction-photos')
                .upload(fileName, photoFile);
            
            if (uploadError) {
                console.error('파일 업로드 오류:', uploadError);
                throw new Error('파일 업로드에 실패했습니다: ' + uploadError.message);
            }
            
            console.log('파일 업로드 성공:', uploadData);
            
            // 업로드된 파일의 공개 URL 가져오기
            const { data: urlData } = supabase.storage
                .from('construction-photos')
                .getPublicUrl(fileName);
            
            console.log('공개 URL:', urlData.publicUrl);
            
            // 데이터베이스에 사진 정보 저장
            const photoData = {
                title: title,
                description: description || '',
                category: '일반', // 기본 카테고리로 설정
                image_url: urlData.publicUrl,
                is_active: true
            };
            
            console.log('저장할 데이터:', photoData);
            
            const { data: insertData, error: insertError } = await supabase
                .from('construction_photos')
                .insert([photoData]);
            
            if (insertError) {
                console.error('데이터베이스 저장 오류:', insertError);
                throw new Error('사진 정보 저장에 실패했습니다: ' + insertError.message);
            }
            
            console.log('데이터베이스 저장 성공:', insertData);
            showMessage('시공사진이 성공적으로 업로드되었습니다!', 'success');
            
            // 폼 초기화
            document.getElementById('upload-form').reset();
            document.getElementById('upload-preview').style.display = 'none';
            
            // 2초 후 게시판으로 이동
            setTimeout(() => {
                window.location.href = 'construction_photos.html';
            }, 2000);
            
            return; // 성공 시 함수 종료
            
        } catch (error) {
            console.error(`업로드 오류 (시도 ${retryCount + 1}/${maxRetries}):`, error);
            retryCount++;
            
            if (retryCount >= maxRetries) {
                showMessage('업로드에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
                return;
            }
            
            // 재시도 전 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
    }
}

// 메시지 표시 함수
function showMessage(message, type = 'success') {
    console.log('메시지 표시:', type, message);
    
    const flashMessages = document.getElementById('flash-messages');
    if (!flashMessages) {
        console.error('flash-messages 요소를 찾을 수 없습니다.');
        alert(message); // fallback
        return;
    }
    
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