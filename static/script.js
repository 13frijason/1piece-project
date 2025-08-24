

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
let autoSlideInterval;

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
            showDefaultSlides();
            return;
        }
        
        if (photos && photos.length > 0) {
            console.log(`${photos.length}개의 시공사진을 찾았습니다.`);
            createSlidesFromData(photos);
        } else {
            console.log('등록된 시공사진이 없습니다. 기본 슬라이드를 표시합니다.');
            showDefaultSlides();
        }
        
    } catch (error) {
        console.error('시공사진 로드 중 예외 발생:', error);
        showDefaultSlides();
    }
}

// 데이터로부터 슬라이드 생성
function createSlidesFromData(photos) {
    console.log('데이터로부터 슬라이드 생성 중...');
    
    const sliderTrack = document.getElementById('construction-slider-track');
    if (!sliderTrack) {
        console.error('슬라이더 트랙을 찾을 수 없습니다.');
        return;
    }
    
    // 기존 슬라이드 제거
    sliderTrack.innerHTML = '';
    
    // 새 슬라이드 생성
    photos.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        
        const img = document.createElement('img');
        img.src = photo.image_url;
        img.alt = photo.title || `시공현장 ${index + 1}`;
        img.loading = 'lazy';
        
        // 이미지 로드 실패 시 기본 이미지로 대체
        img.onerror = function() {
            this.src = 'static/images/hero-bg.jpg';
        };
        
        slide.appendChild(img);
        
        // 슬라이드 정보 추가
        if (photo.title || photo.description) {
            const slideInfo = document.createElement('div');
            slideInfo.className = 'slide-info';
            
            if (photo.title) {
                const title = document.createElement('h4');
                title.textContent = photo.title;
                slideInfo.appendChild(title);
            }
            
            if (photo.description) {
                const desc = document.createElement('p');
                desc.textContent = photo.description;
                slideInfo.appendChild(desc);
            }
            
            slide.appendChild(slideInfo);
        }
        
        sliderTrack.appendChild(slide);
    });
    
    // 슬라이더 초기화
    totalSlides = photos.length;
    currentSlide = 0;
    
    if (totalSlides > 0) {
        showSlide(0);
        startAutoSlide();
        setupSliderControls();
        setupTouchEvents();
        console.log('Supabase 데이터로 슬라이더 초기화 완료');
    }
}

// 기본 슬라이드 표시
function showDefaultSlides() {
    console.log('=== showDefaultSlides 함수 시작 ===');
    
    const sliderTrack = document.getElementById('construction-slider-track');
    if (!sliderTrack) {
        console.error('슬라이더 트랙을 찾을 수 없습니다.');
        return;
    }
    
    console.log('기본 이미지 경로 설정 중...');
    const defaultImages = [
        'static/images/gallery1.jpg',
        'static/images/gallery2.jpg', 
        'static/images/gallery3.jpg',
        'static/images/gallery4.jpg'
    ];
    
    console.log('기본 이미지 경로:', defaultImages);
    
    // 기존 슬라이드 제거
    sliderTrack.innerHTML = '';
    console.log('기존 슬라이드 제거 완료');
    
    // 기본 슬라이드 생성
    defaultImages.forEach((imagePath, index) => {
        console.log(`슬라이드 ${index + 1} 생성 중: ${imagePath}`);
        
        const slide = document.createElement('div');
        slide.className = 'slide';
        
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `시공현장 ${index + 1}`;
        img.loading = 'lazy';
        
        // 이미지 로드 실패 시 기본 이미지로 대체
        img.onerror = function() {
            console.log(`이미지 로드 실패: ${imagePath}, 기본 이미지로 대체`);
            this.src = 'static/images/hero-bg.jpg';
        };
        
        slide.appendChild(img);
        sliderTrack.appendChild(slide);
        
        console.log(`슬라이드 ${index + 1} 생성 완료`);
    });
    
    // 슬라이더 초기화
    totalSlides = defaultImages.length;
    currentSlide = 0;
    
    console.log(`총 슬라이드 수: ${totalSlides}`);
    
    if (totalSlides > 0) {
        currentSlide = 0; // 명시적으로 currentSlide 초기화
        showSlide(0);
        startAutoSlide();
        setupSliderControls();
        setupTouchEvents();
        console.log('기본 슬라이더 초기화 완료');
    } else {
        console.error('슬라이드가 생성되지 않았습니다.');
    }
}

// 특정 슬라이드 표시
function showSlide(index) {
    console.log(`showSlide 호출: index=${index}, totalSlides=${totalSlides}`);
    
    if (totalSlides === 0) {
        console.error('표시할 슬라이드가 없습니다.');
        return;
    }
    
    if (index < 0 || index >= totalSlides) {
        console.error(`잘못된 슬라이드 인덱스: ${index}`);
        return;
    }
    
    const sliderTrack = document.getElementById('construction-slider-track');
    if (!sliderTrack) {
        console.error('슬라이더 트랙을 찾을 수 없습니다.');
        return;
    }
    
    const slideWidth = sliderTrack.offsetWidth;
    const translateX = -index * slideWidth;
    
    console.log(`슬라이드 ${index} 표시: translateX=${translateX}px`);
    sliderTrack.style.transform = `translateX(${translateX}px)`;
    currentSlide = index;
}

// 다음 슬라이드로 이동 (한 방향으로만 순환)
function nextSlide() {
    if (totalSlides === 0) return;
    
    const nextIndex = (currentSlide + 1) % totalSlides;
    showSlide(nextIndex);
}

// 이전 슬라이드로 이동 (한 방향으로만 순환)
function prevSlide() {
    if (totalSlides === 0) return;
    
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(prevIndex);
}

// 자동 슬라이드 시작
function startAutoSlide() {
    if (totalSlides > 1) {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
        autoSlideInterval = setInterval(() => {
            nextSlide();
        }, 3000); // 3초마다 자동 전환
    }
}

// 자동 슬라이드 정지
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
    const sliderContainer = document.querySelector('.construction-slider');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        });
        
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        });
    }
    
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }
}

// 터치 이벤트 설정
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function setupTouchEvents() {
    const sliderContainer = document.querySelector('.construction-slider');
    if (!sliderContainer) return;
    
    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopAutoSlide();
    }, { passive: true });
    
    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
        startAutoSlide();
    }, { passive: true });
}

function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 수평 스와이프가 수직 스와이프보다 클 때만 처리
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
            // 왼쪽으로 스와이프 - 다음 슬라이드
            nextSlide();
        } else if (diffX < -50) {
            // 오른쪽으로 스와이프 - 이전 슬라이드
            prevSlide();
        }
    }
}

// DOM 로드 완료 시 슬라이더 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드됨, 시공사진 로드 시작...');
    showDefaultSlides(); // 즉시 기본 슬라이드 표시
    
    // Supabase 로드 확인
    const checkSupabase = () => {
        if (typeof window.supabase !== 'undefined') {
            loadConstructionPhotos();
        } else {
            setTimeout(checkSupabase, 500);
        }
    };
    
    setTimeout(checkSupabase, 1000);
});

// 페이지 완전 로드 후 슬라이더 상태 확인
window.addEventListener('load', function() {
    console.log('페이지 완전 로드됨, 슬라이더 상태 확인...');
    if (totalSlides === 0) {
        console.log('슬라이더가 초기화되지 않음, 다시 시도...');
        showDefaultSlides();
    }
});

// 견적 계산기 모달
document.addEventListener('DOMContentLoaded', function() {
    const calculatorModal = document.getElementById('calculator-modal');
    const calculatorBtn = document.querySelector('.calculator-btn');
    const closeModal = document.querySelector('.close-modal');
    
    if (calculatorBtn) {
        calculatorBtn.addEventListener('click', () => {
            if (calculatorModal) {
                calculatorModal.style.display = 'block';
            }
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (calculatorModal) {
                calculatorModal.style.display = 'none';
            }
        });
    }
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === calculatorModal) {
            calculatorModal.style.display = 'none';
        }
    });
    
    // 견적 계산 폼 제출
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productType = document.getElementById('product-type').value;
            const manufacturer = document.getElementById('manufacturer').value;
            const area = parseInt(document.getElementById('area').value);
            
            if (!productType || !manufacturer || !area) {
                alert('모든 필드를 입력해주세요.');
                return;
            }
            
            // 간단한 견적 계산 (실제로는 더 복잡한 계산 필요)
            let basePrice = 0;
            switch (productType) {
                case 'system':
                    basePrice = 1500000; // 150만원
                    break;
                case 'ceiling':
                    basePrice = 800000;  // 80만원
                    break;
                case 'stand':
                    basePrice = 500000;  // 50만원
                    break;
            }
            
            // 평수에 따른 가격 조정
            let areaMultiplier = 1;
            if (area <= 20) areaMultiplier = 0.8;
            else if (area <= 40) areaMultiplier = 1.0;
            else if (area <= 60) areaMultiplier = 1.2;
            else areaMultiplier = 1.5;
            
            const estimatedPrice = Math.round(basePrice * areaMultiplier);
            
            // 결과 표시
            const resultDiv = document.getElementById('calculation-result');
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <h3>견적 결과</h3>
                    <p><strong>제품:</strong> ${productType === 'system' ? '시스템에어컨' : productType === 'ceiling' ? '천장형에어컨' : '스탠드형에어컨'}</p>
                    <p><strong>제조사:</strong> ${manufacturer.toUpperCase()}</p>
                    <p><strong>평수:</strong> ${area}평</p>
                    <p><strong>예상 견적:</strong> ${estimatedPrice.toLocaleString()}원</p>
                    <p class="note">* 이는 예상 견적이며, 정확한 견적은 현장 방문 후 결정됩니다.</p>
                `;
            }
        });
    }
});

// 견적 문의 폼 제출
document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // 간단한 유효성 검사
            if (!data['customer-name'] || !data['customer-phone'] || !data['service-type'] || !data['detailed-request']) {
                alert('모든 필드를 입력해주세요.');
                return;
            }
            
            // 성공 메시지 (실제로는 서버로 전송)
            alert('견적 문의가 성공적으로 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.');
            this.reset();
        });
    }
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