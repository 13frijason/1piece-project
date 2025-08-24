

// 모바일 메뉴 토글
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.08)';
    }
});

// 폼 제출 처리
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // 간단한 유효성 검사
            if (!data.name || !data.email || !data.message) {
                alert('모든 필드를 입력해주세요.');
                return;
            }
            
            // 성공 메시지 (실제로는 서버로 전송)
            alert('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.');
            this.reset();
        });
    }
});

// 시공사진 슬라이더
let currentSlide = 0;
let slides = [];
let totalSlides = 0;

// Supabase에서 시공사진 데이터 가져오기
async function loadConstructionPhotos() {
    try {
        console.log('시공사진 데이터 로딩 시작...');
        
        // Supabase 클라이언트 확인
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase가 로드되지 않았습니다. 기본 슬라이드를 표시합니다.');
            showDefaultSlides();
            return;
        }
        
        console.log('Supabase 클라이언트 생성 중...');
        // Supabase 클라이언트 생성
        const supabaseUrl = 'https://jykkpfrpnpkycqyokqnm.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a2twZnJwbnBreWNxeW9rcW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTY1NjgsImV4cCI6MjA2ODI5MjU2OH0.vMXLe-ccOQXuH2I6M-9WIYJcxoCMQygh5ldBGdd3jzk';
        
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase 클라이언트 생성 완료');
        
        console.log('데이터베이스에서 시공사진 조회 중...');
        const { data: photos, error } = await supabaseClient
            .from('construction_photos')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10); // 최대 10개만 표시
        
        if (error) {
            console.error('시공사진 로드 오류:', error);
            console.log('오류로 인해 기본 슬라이드를 표시합니다.');
            showDefaultSlides();
            return;
        }
        
        console.log('로드된 시공사진:', photos);
        
        if (photos && photos.length > 0) {
            console.log(`${photos.length}개의 시공사진을 슬라이더에 표시합니다.`);
            createSlidesFromData(photos);
        } else {
            console.log('활성화된 시공사진이 없습니다. 기본 슬라이드를 표시합니다.');
            showDefaultSlides();
        }
        
    } catch (error) {
        console.error('시공사진 로드 중 오류:', error);
        console.log('예외 발생으로 기본 슬라이드를 표시합니다.');
        showDefaultSlides();
    }
}

// 데이터로부터 슬라이드 생성
function createSlidesFromData(photos) {
    const sliderTrack = document.getElementById('construction-slider-track');
    if (!sliderTrack) return;
    
    // 기존 로딩 슬라이드 제거
    sliderTrack.innerHTML = '';
    
    // 각 사진에 대해 슬라이드 생성
    photos.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
            <img src="${photo.image_url}" alt="${photo.title}" loading="lazy">
            <div class="slide-info">
                <h4>${photo.title}</h4>
                ${photo.description ? `<p>${photo.description}</p>` : ''}
            </div>
        `;
        sliderTrack.appendChild(slide);
    });
    
    // 슬라이더 초기화
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (totalSlides > 0) {
        showSlide(0);
        startAutoSlide();
        setupSliderControls();
        setupTouchEvents(); // 터치 이벤트 설정 추가
    }
}

// 기본 슬라이드 표시 (데이터가 없을 때)
function showDefaultSlides() {
    console.log('기본 슬라이드 표시 시작');
    const sliderTrack = document.getElementById('construction-slider-track');
    if (!sliderTrack) {
        console.error('슬라이더 트랙을 찾을 수 없습니다.');
        return;
    }
    
    console.log('기본 슬라이드 HTML 생성 중...');
    sliderTrack.innerHTML = `
        <div class="slide"><img src="static/images/gallery1.jpg" alt="시공현장 1"></div>
        <div class="slide"><img src="static/images/gallery2.jpg" alt="시공현장 2"></div>
        <div class="slide"><img src="static/images/gallery3.jpg" alt="시공현장 3"></div>
        <div class="slide"><img src="static/images/gallery4.jpg" alt="시공현장 4"></div>
        <div class="slide"><img src="static/images/gallery5.jpg" alt="시공현장 5"></div>
    `;
    
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    console.log(`기본 슬라이드 ${totalSlides}개 생성됨`);
    
    if (totalSlides > 0) {
        showSlide(0);
        startAutoSlide();
        setupSliderControls();
        setupTouchEvents();
        console.log('기본 슬라이더 초기화 완료');
    }
}

function showSlide(index) {
    console.log(`showSlide 호출: index=${index}, totalSlides=${totalSlides}`);
    
    if (totalSlides === 0) {
        console.log('슬라이드가 없습니다.');
        return;
    }
    
    if (index >= totalSlides) currentSlide = 0;
    if (index < 0) currentSlide = totalSlides - 1;
    
    console.log(`현재 슬라이드: ${currentSlide}`);
    
    slides.forEach((slide, i) => {
        const translateX = 100 * (i - currentSlide);
        slide.style.transform = `translateX(${translateX}%)`;
        console.log(`슬라이드 ${i}: translateX(${translateX}%)`);
    });
}

function nextSlide() {
    currentSlide++;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide--;
    showSlide(currentSlide);
}

// 자동 슬라이드 시작
let autoSlideInterval;

function startAutoSlide() {
    if (totalSlides > 1) {
        // 기존 인터벌 제거
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
        
        autoSlideInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    }
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// 슬라이더 컨트롤 설정
function setupSliderControls() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            prevSlide();
            startAutoSlide(); // 자동 슬라이드 재시작
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            nextSlide();
            startAutoSlide(); // 자동 슬라이드 재시작
        });
    }
    
    // 슬라이더에 마우스 호버 시 자동 슬라이드 일시정지
    const sliderContainer = document.querySelector('.construction-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }
}

// 페이지 로드 시 시공사진 로드
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드됨, 시공사진 로드 시작...');
    
    // 즉시 기본 슬라이드 표시 (로딩 상태)
    showDefaultSlides();
    
    // Supabase가 로드될 때까지 대기
    const checkSupabase = () => {
        if (typeof window.supabase !== 'undefined') {
            console.log('Supabase 로드됨, 시공사진 로드 시작');
            loadConstructionPhotos();
        } else {
            console.log('Supabase 아직 로드되지 않음, 500ms 후 재시도...');
            setTimeout(checkSupabase, 500);
        }
    };
    
    // 1초 후 Supabase 체크 시작 (안정성을 위해)
    setTimeout(checkSupabase, 1000);
});

// 이미지 지연 로딩
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// 터치 이벤트 최적화
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function setupTouchEvents() {
    const sliderContainer = document.querySelector('.construction-slider');
    if (!sliderContainer) return;
    
    sliderContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopAutoSlide(); // 터치 시 자동 슬라이드 일시정지
    }, { passive: true });
    
    sliderContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
        startAutoSlide(); // 터치 후 자동 슬라이드 재시작
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 수평 스와이프가 수직 스와이프보다 클 때만 처리
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
            // 왼쪽으로 스와이프 (다음 슬라이드)
            if (totalSlides > 0) {
                nextSlide();
            }
        } else {
            // 오른쪽으로 스와이프 (이전 슬라이드)
            if (totalSlides > 0) {
                prevSlide();
            }
        }
    }
}

// 모바일 최적화
function handleMobileOptimization() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // 모바일에서 터치 영역 확대
        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
        
        // 모바일에서 폰트 크기 조정
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.fontSize = '16px';
        });
    }
}

// 페이지 로드 시 모바일 최적화 적용
window.addEventListener('load', handleMobileOptimization);
window.addEventListener('resize', handleMobileOptimization); 