

// 실시간 채팅 위젯
const liveChatBtn = document.querySelector('.live-chat-button');
const liveChatWidget = document.getElementById('live-chat-widget');
const closeChatBtn = document.querySelector('.close-chat');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input input');
const sendMessageBtn = document.querySelector('.send-message');

if (liveChatBtn) {
    liveChatBtn.addEventListener('click', () => {
        liveChatWidget.style.display = 'block';
        addMessage('상담원', '안녕하세요! 원피스공조입니다. 무엇을 도와드릴까요?');
    });
}

if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        liveChatWidget.style.display = 'none';
    });
}

function addMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender.toLowerCase()}`;
    messageDiv.innerHTML = `
        <strong>${sender}:</strong>
        <p>${message}</p>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', sendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addMessage('고객', message);
        chatInput.value = '';
        
        // 자동 응답 (실제로는 서버와 통신)
        setTimeout(() => {
            addMessage('상담원', '문의해 주셔서 감사합니다. 잠시만 기다려주세요.');
        }, 1000);
    }
}

// 로그인 모달 기능
const adminLoginBtn = document.getElementById('admin-login-btn');
const loginModal = document.getElementById('login-modal');
const closeLoginModalBtn = document.querySelector('#login-modal .close-modal');

if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
}

if (closeLoginModalBtn) {
    closeLoginModalBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// 관리자 권한 확인 함수
function isAdmin() {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return false;
    
    const currentUser = JSON.parse(savedUser);
    return currentUser && (currentUser.username === 'admin' || currentUser.email === 'admin@admin.local');
}

// 관리자 컨트롤 표시/숨김 함수
function showAdminControls() {
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => btn.style.display = 'inline-block');
}

function hideAdminControls() {
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => btn.style.display = 'none');
}

// 관리자 기능 함수들
function openConstructionUpload() {
    if (!isAdmin()) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    // 시공사진 업로드 페이지로 이동
    window.location.href = 'upload_construction_photo.html';
}

function openEstimateManagement() {
    if (!isAdmin()) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    // 견적문의 관리 페이지로 이동
    window.location.href = 'board.html';
}

function openSiteSettings() {
    if (!isAdmin()) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    // 사이트 설정 페이지 (향후 구현)
    alert('사이트 설정 기능은 준비 중입니다.');
}

// 네비게이션 바 스크롤 효과
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        header.style.backgroundColor = '#fff';
    }
});

// 모바일 메뉴 토글
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// 모바일 메뉴 링크 클릭 시 메뉴 닫기
const navLinksItems = document.querySelectorAll('.nav-links a');
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// 모바일에서 메뉴 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    }
});

// 네비게이션 링크 클릭 시 부드러운 스크롤
document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 설치비 계산기
const calculatorForm = document.getElementById('calculator-form');
if (calculatorForm) {
    calculatorForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productType = document.getElementById('product-type').value;
    const manufacturer = document.getElementById('manufacturer').value;
    const area = document.getElementById('area').value;
    
    // 기본 설치비 계산 (실제 계산 로직은 더 복잡할 수 있음)
    let basePrice = 0;
    switch(productType) {
        case 'system':
            basePrice = 1500000;
            break;
        case 'ceiling':
            basePrice = 800000;
            break;
        case 'stand':
            basePrice = 500000;
            break;
    }
    
    // 평수에 따른 추가 비용
    const areaPrice = area * 50000;
    
    // 제조사별 가격 차이
    const manufacturerPrice = manufacturer === 'samsung' ? 100000 : 0;
    
    const totalPrice = basePrice + areaPrice + manufacturerPrice;
    
    // 결과 표시
    const resultDiv = document.getElementById('calculation-result');
    resultDiv.innerHTML = `
        <h3>예상 설치비</h3>
        <p>기본 설치비: ${basePrice.toLocaleString()}원</p>
        <p>평수 추가비용: ${areaPrice.toLocaleString()}원</p>
        <p>제조사 추가비용: ${manufacturerPrice.toLocaleString()}원</p>
        <p class="total-price">총 예상 비용: ${totalPrice.toLocaleString()}원</p>
        <p class="note">* 실제 견적은 현장 방문 후 정확한 견적이 산출됩니다.</p>
    `;
});
}


// 갤러리 이미지 로딩
function loadGalleryImages() {
    const galleryGrid = document.querySelector('.gallery-grid');
    const images = [
        { src: 'images/gallery1.jpg', alt: '시스템 에어컨 설치' },
        { src: 'images/gallery2.jpg', alt: '천장형 에어컨 설치' },
        { src: 'images/gallery3.jpg', alt: '스탠드형 에어컨 설치' },
        { src: 'images/gallery4.jpg', alt: '이전 설치 작업' },
        { src: 'images/gallery5.jpg', alt: '상업용 에어컨 설치' },
        { src: 'images/gallery6.jpg', alt: '주거용 에어컨 설치' }
    ];
    
    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        imgElement.alt = image.alt;
        imgElement.addEventListener('click', () => showImageModal(image));
        galleryGrid.appendChild(imgElement);
    });
}

// 이미지 모달 표시
function showImageModal(image) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <img src="${image.src}" alt="${image.alt}">
            <button class="close-modal">&times;</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 문의하기 폼 제출 처리
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // 여기에 실제 폼 제출 로직 구현
        console.log('문의사항 제출:', data);
        
        // 성공 메시지 표시
        alert('문의사항이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
        this.reset();
    });
}

// 페이지 로드 시 갤러리 이미지 로드
document.addEventListener('DOMContentLoaded', loadGalleryImages);

// 스크롤 애니메이션
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// 시공현장 슬라이더
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;

    // 슬라이드 이동 함수
    function moveSlide(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    // 다음 슬라이드
    function nextSlide() {
        if (currentIndex < slides.length - 1) {
            moveSlide(currentIndex + 1);
        } else {
            moveSlide(0);
        }
    }

    // 이전 슬라이드
    function prevSlide() {
        if (currentIndex > 0) {
            moveSlide(currentIndex - 1);
        } else {
            moveSlide(slides.length - 1);
        }
    }

    // 자동 슬라이드
    let slideInterval = setInterval(nextSlide, 5000);

    // 버튼 이벤트 리스너
    nextBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        nextSlide();
        slideInterval = setInterval(nextSlide, 5000);
    });

    prevBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        prevSlide();
        slideInterval = setInterval(nextSlide, 5000);
    });

    // 터치 이벤트 지원
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            nextSlide();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            prevSlide();
        }
    }
});

// 설치비 계산기 모달
const calculatorBtn = document.getElementById('calculator-btn');
const calculatorModal = document.getElementById('calculator-modal');
const closeModalBtn = document.querySelector('.close-modal');

if (calculatorBtn) {
    calculatorBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (calculatorModal) {
            calculatorModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        }
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (calculatorModal) {
            calculatorModal.style.display = 'none';
            document.body.style.overflow = ''; // 스크롤 복원
        }
    });
}

// 모달 외부 클릭시 닫기
if (calculatorModal) {
    calculatorModal.addEventListener('click', (e) => {
        if (e.target === calculatorModal) {
            calculatorModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && calculatorModal && calculatorModal.style.display === 'block') {
        calculatorModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}); 

document.addEventListener('DOMContentLoaded', function() {
  const navQuote = document.querySelector('.nav-links a[href="#quote"]');
  if (navQuote) {
    navQuote.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById('quote');
      const offset = 50; // 헤더 높이 등 원하는 만큼 조절
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }
}); 

// 페이지별 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 관리자 권한 확인 및 컨트롤 표시
    if (isAdmin()) {
        showAdminControls();
    } else {
        hideAdminControls();
    }
    
    // 현재 페이지 URL 확인
    const currentPage = window.location.pathname;
    
    // 갤러리 이미지 로드 (메인 페이지에서만)
    if (currentPage === '/' || currentPage === '/index.html' || currentPage.includes('index.html')) {
        loadGalleryImages();
    }
    
    // 슬라이더 기능 (메인 페이지에서만)
    if (currentPage === '/' || currentPage === '/index.html' || currentPage.includes('index.html')) {
        initializeSlider();
    }
    
    // 기타 공통 기능들
    initializeCommonFeatures();
});

// 공통 기능 초기화
function initializeCommonFeatures() {
    // 실시간 채팅
    const liveChatBtn = document.querySelector('.live-chat-button');
    const liveChatWidget = document.getElementById('live-chat-widget');
    const closeChatBtn = document.querySelector('.close-chat');
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendMessageBtn = document.querySelector('.send-message');

    if (liveChatBtn && liveChatWidget) {
        liveChatBtn.addEventListener('click', () => {
            liveChatWidget.classList.add('active');
        });
    }

    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            liveChatWidget.classList.remove('active');
        });
    }

    if (sendMessageBtn && chatInput && chatMessages) {
        sendMessageBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // 스크롤 이벤트
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // 모바일 메뉴
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // 모바일 메뉴 링크 클릭시 메뉴 닫기
        const navLinksItems = document.querySelectorAll('.nav-links a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // 부드러운 스크롤
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;
                const headerHeight = document.querySelector('header').offsetHeight;
                
                window.scrollTo({
                    top: offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 모달 외부 클릭시 닫기
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // 견적문의 폼 제출 처리
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const formData = new FormData(this);
            const customerName = formData.get('customer-name');
            const customerPhone = formData.get('customer-phone');
            const serviceType = formData.get('service-type');
            const detailedRequest = formData.get('detailed-request');
            
            // 폼 데이터를 URL 파라미터로 변환
            const params = new URLSearchParams();
            params.append('customer-name', customerName);
            params.append('customer-phone', customerPhone);
            params.append('service-type', serviceType);
            params.append('detailed-request', detailedRequest);
            
            // board.html로 이동하면서 폼 데이터 전달
            window.location.href = `board.html?${params.toString()}`;
        });
    }
}

// 갤러리 이미지 로드 함수
function loadGalleryImages() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return; // 갤러리 그리드가 없으면 함수 종료
    
    const galleryImages = [
        'static/images/gallery1.jpg',
        'static/images/gallery2.jpg',
        'static/images/gallery3.jpg',
        'static/images/gallery4.jpg',
        'static/images/gallery5.jpg',
        'static/images/gallery6.jpg',
        'static/images/gallery7.jpg',
        'static/images/gallery8.jpg',
        'static/images/gallery9.jpg',
        'static/images/gallery10.jpg',
        'static/images/gallery11.jpg',
        'static/images/gallery12.jpg',
        'static/images/gallery13.jpg'
    ];

    galleryImages.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = '갤러리 이미지';
        imgElement.style.width = '100%';
        imgElement.style.height = 'auto';
        imgElement.style.cursor = 'pointer';
        
        imgElement.addEventListener('click', () => showImageModal(image));
        
        galleryGrid.appendChild(imgElement);
    });
}

// 슬라이더 초기화 함수
function initializeSlider() {
    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!track || slides.length === 0) return; // 슬라이더 요소가 없으면 함수 종료
    
    let currentIndex = 0;
    const slideWidth = slides[0].offsetWidth;
    const maxIndex = slides.length - 1;

    function moveSlide(index) {
        if (track) {
            track.style.transform = `translateX(-${index * slideWidth}px)`;
        }
        currentIndex = index;
    }

    function nextSlide() {
        if (currentIndex < maxIndex) {
            moveSlide(currentIndex + 1);
        } else {
            moveSlide(0);
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            moveSlide(currentIndex - 1);
        } else {
            moveSlide(slides.length - 1);
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
        });
    }

    // 터치 이벤트
    if (track) {
        track.addEventListener('touchstart', e => {
            // 터치 시작 처리
        });

        track.addEventListener('touchend', e => {
            // 터치 종료 처리
        });
    }

    // 자동 슬라이드
    setInterval(nextSlide, 5000);
} 