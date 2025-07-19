// Supabase 설정
const SUPABASE_URL = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 페이지 로드 시 시공사진 로드
document.addEventListener('DOMContentLoaded', function() {
    loadConstructionPhotos();
});

// 시공사진 로드 함수
async function loadConstructionPhotos() {
    try {
        const { data: photos, error } = await supabaseClient
            .from('construction_photos')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(13);

        if (error) {
            console.error('시공사진 로드 오류:', error);
            return;
        }

        // 활성화된 사진이 있으면 슬라이더 업데이트
        if (photos && photos.length > 0) {
            updateSlider(photos);
        }
    } catch (error) {
        console.error('시공사진 로드 오류:', error);
    }
}

// 슬라이더 업데이트 함수
function updateSlider(photos) {
    const sliderTrack = document.querySelector('.slider-track');
    
    if (!sliderTrack) return;
    
    // 기존 슬라이드 제거
    sliderTrack.innerHTML = '';
    
    // 새로운 사진들로 슬라이드 생성
    photos.forEach(photo => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `<img src="${photo.image_url}" alt="${photo.title}">`;
        sliderTrack.appendChild(slide);
    });
    
    // 슬라이더 초기화
    initializeSlider();
}

// 슬라이더 초기화 함수
function initializeSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!sliderTrack || slides.length === 0) return;
    
    let currentIndex = 0;
    const slideWidth = slides[0].offsetWidth;
    
    // 슬라이더 위치 초기화
    updateSliderPosition();
    
    // 이전 버튼 이벤트
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSliderPosition();
        });
    }
    
    // 다음 버튼 이벤트
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSliderPosition();
        });
    }
    
    // 슬라이더 위치 업데이트 함수
    function updateSliderPosition() {
        const translateX = -currentIndex * slideWidth;
        sliderTrack.style.transform = `translateX(${translateX}px)`;
    }
    
    // 자동 슬라이드 (선택사항)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSliderPosition();
    }, 5000); // 5초마다 자동 슬라이드
} 