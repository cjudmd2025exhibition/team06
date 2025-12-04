// 드래그 가능한 아이템들 관리
class DraggableManager {
    constructor() {
        this.draggableItems = document.querySelectorAll('.draggable-item');
        this.isDragging = false;
        this.currentItem = null;
        this.offset = { x: 0, y: 0 };
        this.lastMoveTime = 0;
        this.throttleDelay = 16; // 60fps
        
        // 요소가 존재하는 경우에만 초기화
        if (this.draggableItems.length > 0) {
            this.init();
        }
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        this.draggableItems.forEach(item => {
            item.addEventListener('mousedown', this.handleMouseDown.bind(this));
            item.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        });

        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // 화면 크기 변경 감지
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleMouseDown(e) {
        e.preventDefault();
        this.startDrag(e.target.closest('.draggable-item'), e.clientX, e.clientY);
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const target = e.target.closest('.draggable-item');
        if (target) {
            this.startDrag(target, touch.clientX, touch.clientY);
        }
    }

    startDrag(item, clientX, clientY) {
        if (!item) return;
        
        this.isDragging = true;
        this.currentItem = item;
        
        const rect = item.getBoundingClientRect();
        this.offset.x = clientX - rect.left;
        this.offset.y = clientY - rect.top;
        
        // z-index 변경하지 않고 원래 값 유지
        // item.style.zIndex = '1000';
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.currentItem) return;
        
        e.preventDefault();
        this.throttledUpdatePosition(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        if (!this.isDragging || !this.currentItem) return;
        
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        this.throttledUpdatePosition(touch.clientX, touch.clientY);
    }
    
    throttledUpdatePosition(clientX, clientY) {
        const now = Date.now();
        if (now - this.lastMoveTime >= this.throttleDelay) {
            this.updatePosition(clientX, clientY);
            this.lastMoveTime = now;
        }
    }

    updatePosition(clientX, clientY) {
        const container = document.querySelector('.draggable-container');
        const containerRect = container.getBoundingClientRect();
        
        // 마우스 위치에서 오프셋을 빼서 아이템의 실제 위치 계산
        let newX = clientX - containerRect.left - this.offset.x;
        let newY = clientY - containerRect.top - this.offset.y;
        
        // 반응형 경계 제한 적용
        if (window.innerWidth <= 768) {
            const maxX = containerRect.width - this.currentItem.offsetWidth;
            const maxY = containerRect.height - this.currentItem.offsetHeight;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
        }
        
        this.currentItem.style.left = newX + 'px';
        this.currentItem.style.top = newY + 'px';
    }

    handleMouseUp(e) {
        this.endDrag();
    }

    handleTouchEnd(e) {
        this.endDrag();
    }

    endDrag() {
        if (!this.isDragging || !this.currentItem) return;
        
        this.isDragging = false;
        // z-index 원래 값으로 복원하지 않음 - CSS에서 설정한 값 유지
        // this.currentItem.style.zIndex = '5';
        this.currentItem = null;
    }
    
    handleResize() {
        // 화면 크기 변경 시 드래그 중이면 종료
        if (this.isDragging) {
            this.endDrag();
        }
    }
}

// 메인 로고 호버 관리
class MainLogoManager {
    constructor() {
        this.mainLogo = document.querySelector('.main-logo');
        this.allLogos = document.querySelectorAll('.main-logo-image');
        this.desktopLogos = document.querySelectorAll('.desktop-mobile-only');
        this.mobileLogos = document.querySelectorAll('.phone-only');
        this.currentLogoIndex = 0;
        this.hoverCount = 0;
        this.autoChangeInterval = null;
        
        // 요소가 존재하는 경우에만 초기화
        if (this.mainLogo && this.allLogos.length > 0) {
            this.init();
        }
    }

    init() {
        this.addEventListeners();
        this.showLogo(0); // 첫 번째 로고 표시
        
        // 모바일 버전에서는 자동으로 로고 변경
        if (window.innerWidth <= 768) {
            this.startAutoChange();
        }
    }

    addEventListeners() {
        if (!this.mainLogo) return;
        
        this.mainLogo.addEventListener('click', this.handleClick.bind(this));
        
        // 화면 크기 변경 감지
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        if (window.innerWidth <= 768) {
            this.startAutoChange();
            // 모바일로 전환 시 첫 번째 모바일 로고 표시
            this.currentLogoIndex = 0;
            this.showLogo(0);
        } else {
            this.stopAutoChange();
            // 데스크톱으로 전환 시 첫 번째 데스크톱 로고 표시
            this.currentLogoIndex = 0;
            this.showLogo(0);
        }
    }

    startAutoChange() {
        if (this.autoChangeInterval) return;
        
        this.autoChangeInterval = setInterval(() => {
            this.showNextLogo();
        }, 2000); // 2초마다 변경
    }

    stopAutoChange() {
        if (this.autoChangeInterval) {
            clearInterval(this.autoChangeInterval);
            this.autoChangeInterval = null;
        }
    }

    handleClick() {
        // 데스크톱 버전에서는 클릭으로 로고 변경
        if (window.innerWidth > 768) {
            this.showNextLogo();
        }
    }

    showNextLogo() {
        const isMobile = window.innerWidth <= 768;
        const logos = isMobile ? this.mobileLogos : this.desktopLogos;
        
        if (logos.length === 0) return;
        
        // 해당 디바이스의 로고들만 순환
        this.currentLogoIndex = (this.currentLogoIndex + 1) % logos.length;
        this.showLogo(this.currentLogoIndex);
    }

    showLogo(index) {
        const isMobile = window.innerWidth <= 768;
        const logos = isMobile ? this.mobileLogos : this.desktopLogos;
        
        if (logos.length === 0) return;
        
        // 모든 로고 숨기기
        this.allLogos.forEach(logo => {
            logo.style.display = 'none';
        });
        
        // 선택된 로고 표시
        if (logos[index]) {
            logos[index].style.display = 'block';
            this.currentLogoIndex = index;
        }
    }
}

// 햄버거 바 관리
class HamburgerManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        this.hamburger.addEventListener('click', this.toggleMenu.bind(this));
        
        // 모바일 메뉴 링크 클릭 시 메뉴 닫기
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });
        
        // 배경 클릭 시 메뉴 닫기
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target === this.mobileMenu) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.hamburger.classList.add('active');
        this.mobileMenu.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        // 링크 클릭 시 애니메이션 제거를 위해 즉시 닫기
        this.mobileMenu.style.transition = 'none';
        setTimeout(() => {
            this.mobileMenu.style.transition = '';
        }, 10);
    }
}

// 푸터 로고 관리
class FooterLogoManager {
    constructor() {
        this.footerLogoLink = document.querySelector('.footer-logo-link');
        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        if (this.footerLogoLink) {
            this.footerLogoLink.addEventListener('click', this.handleClick.bind(this));
        }
    }

    handleClick(e) {
        e.preventDefault();
        // 페이지 상단으로 부드럽게 스크롤
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// 텍스트 슬라이더 관리자
class TextSliderManager {
    constructor() {
        this.currentSlide = 0;
        this.texts = [
            `실패를 고백하고,<br>
            <span class="highlight-text">놓아주기</span>와 <span class="highlight-text">자기 다짐</span>으로<br>
            <span class="highlight-text">자기성찰과 지속적인 성장을 이끕니다</span>`,
            `<span class="highlight-text">슬리피즘의 헌금</span>은<br>
            <span class="highlight-text">두 가지 방식</span>으로 참여할 수 있습니다`,
            `<img src="img/description.webp" alt="description" class="slider-image" style="max-width: 90%; height: auto; margin-right: 120px; display: block;">`,
            `<img src="img/description2.webp" alt="description2" class="slider-image" style="max-width: 90%; height: auto; margin-right: 120px; display: block;">`
        ];
        this.textElement = document.getElementById('fourth-text');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.mobileDots = document.querySelectorAll('.mobile-dot');
        this.autoSlideInterval = null;
        
        // 필수 요소가 존재하는 경우에만 초기화
        if (this.textElement && this.prevBtn && this.nextBtn) {
            this.init();
        }
    }

    init() {
        // 리사이즈 이벤트 리스너 추가 (2560px 이상일 때 이미지 margin-top 조정)
        window.addEventListener('resize', () => {
            this.adjustImageMargin();
        });
        
        // 초기 로드 시에도 조정
        setTimeout(() => {
            this.adjustImageMargin();
        }, 100);
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
                this.resetAutoSlide();
            });
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoSlide();
            });
        }
        
        this.mobileDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoSlide();
            });
        });
        
        this.updateSlide();
        this.startAutoSlide();
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // 3초마다 자동 슬라이드
    }

    resetAutoSlide() {
        clearInterval(this.autoSlideInterval);
        this.startAutoSlide();
    }

    prevSlide() {
        this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.texts.length - 1;
        this.updateSlide();
    }

    nextSlide() {
        this.currentSlide = this.currentSlide < this.texts.length - 1 ? this.currentSlide + 1 : 0;
        this.updateSlide();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlide();
    }

    updateSlide() {
        // 슬라이드 아웃 애니메이션
        this.textElement.classList.add('slide-out');
        
        setTimeout(() => {
            // 내용 변경
            this.textElement.innerHTML = this.texts[this.currentSlide];
            
            // 이미지가 있는 경우 로드 확인
            const images = this.textElement.querySelectorAll('img');
            images.forEach(img => {
                // 인라인 스타일에서 margin-top 제거 (CSS가 적용되도록)
                img.style.marginTop = '';
                
                img.onload = () => {
                    console.log('이미지 로드 성공:', img.src);
                };
                img.onerror = () => {
                    console.error('이미지 로드 실패:', img.src);
                };
            });
            
            // 슬라이드 인 애니메이션
            this.textElement.classList.remove('slide-out');
            this.textElement.classList.add('slide-in');
            
            // 슬라이더 버튼 상태 업데이트
            this.prevBtn.classList.toggle('active', this.currentSlide > 0);
            this.nextBtn.classList.toggle('active', this.currentSlide < this.texts.length - 1);
            
            // 모바일 도트 상태 업데이트
            this.mobileDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentSlide);
            });
            
            // slide-in 클래스 제거 (다음 전환을 위해)
            setTimeout(() => {
                this.textElement.classList.remove('slide-in');
            }, 300);
            
            // 이미지 margin-top 조정 (약간의 지연 후) - 인라인 스타일 제거
            setTimeout(() => {
                const images = this.textElement.querySelectorAll('img.slider-image');
                images.forEach(img => {
                    img.style.marginTop = ''; // 인라인 스타일 제거하여 CSS 적용
                });
            }, 200);
        }, 150);
    }
    
    adjustImageMargin() {
        // 인라인 스타일에서 margin-top 제거 (CSS가 적용되도록)
        const images = this.textElement.querySelectorAll('img.slider-image');
        images.forEach(img => {
            img.style.marginTop = '';
        });
    }
}

// Hashtag Animation Manager
class HashtagAnimationManager {
    constructor() {
        this.strips = [
            document.getElementById('hashtagStrip1'),
            document.getElementById('hashtagStrip2'),
            document.getElementById('hashtagStrip3'),
            document.getElementById('hashtagStrip4')
        ];
        this.posX = [0, 0, 0, 0];
        this.speeds = [0.5, 0.3, 0.7, 0.4]; // 각각 다른 속도
    }

    init() {
        this.strips.forEach((strip, index) => {
            if (strip) {
                this.animate(index);
            }
        });
    }

    animate(index) {
        this.posX[index] -= this.speeds[index];
        const stripWidth = this.strips[index].scrollWidth / 2; // 절반 반복
        if (Math.abs(this.posX[index]) >= stripWidth) {
            this.posX[index] = 0;
        }
        this.strips[index].style.transform = `translate3d(${this.posX[index]}px, 0, 0)`;
        requestAnimationFrame(() => this.animate(index));
    }
}

// 해시태그 클릭 이벤트 방지
document.addEventListener('DOMContentLoaded', () => {
    // 해시태그 클릭 시 사라지는 애니메이션 방지
    const hashtagTags = document.querySelectorAll('.hashtag-tag');
    hashtagTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // 아무것도 하지 않음 (클릭 방지)
        });
    });
});




// Carpet Animation
// Carpet drag functionality
let isDragging = false;
let startX, startY, initialX, initialY;

function initCarpetDrag() {
    const carpetImage = document.getElementById('carpet-image');
    
    // Mouse events
    carpetImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events for mobile
    carpetImage.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', endDrag);
    
    // Double click for animation
    carpetImage.addEventListener('dblclick', moveCarpet);
}

function startDrag(e) {
    isDragging = true;
    const carpetImage = document.getElementById('carpet-image');
    const sleepbuImage = document.getElementById('sleepbu-image');
    carpetImage.classList.add('dragging');
    
    // 드래그 시작 시 peek 클래스 제거하고 show 클래스만 사용 (breathing 애니메이션 활성화)
    if (sleepbuImage) {
        if (sleepbuImage.classList.contains('peek')) {
            sleepbuImage.classList.remove('peek');
            sleepbuImage.dataset.hadPeek = 'true'; // 나중에 다시 추가하기 위해 표시
        }
        sleepbuImage.classList.add('show'); // breathing 애니메이션 활성화
    }
    
    // shake 클래스를 제거해서 transform이 자유롭게 작동하도록
    if (carpetImage.classList.contains('shake')) {
        carpetImage.classList.remove('shake');
        carpetImage.dataset.hadShake = 'true'; // 나중에 다시 추가하기 위해 표시
    }
    
    startSnoringSound();
    
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = carpetImage.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    e.preventDefault();
}

function startDragTouch(e) {
    isDragging = true;
    const carpetImage = document.getElementById('carpet-image');
    const sleepbuImage = document.getElementById('sleepbu-image');
    carpetImage.classList.add('dragging');
    
    // 드래그 시작 시 peek 클래스 제거하고 show 클래스만 사용 (breathing 애니메이션 활성화)
    if (sleepbuImage) {
        if (sleepbuImage.classList.contains('peek')) {
            sleepbuImage.classList.remove('peek');
            sleepbuImage.dataset.hadPeek = 'true'; // 나중에 다시 추가하기 위해 표시
        }
        sleepbuImage.classList.add('show'); // breathing 애니메이션 활성화
    }
    
    // shake 클래스를 제거해서 transform이 자유롭게 작동하도록
    if (carpetImage.classList.contains('shake')) {
        carpetImage.classList.remove('shake');
        carpetImage.dataset.hadShake = 'true'; // 나중에 다시 추가하기 위해 표시
    }
    
    startSnoringSound();
    
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    
    const rect = carpetImage.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const carpetImage = document.getElementById('carpet-image');
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    carpetImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    carpetImage.style.marginTop = '50px'; // 초기 위치 유지
}

function dragTouch(e) {
    if (!isDragging) return;
    
    const carpetImage = document.getElementById('carpet-image');
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    
    carpetImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    carpetImage.style.marginTop = '50px'; // 초기 위치 유지
}

function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    const carpetImage = document.getElementById('carpet-image');
    const sleepbuImage = document.getElementById('sleepbu-image');
    carpetImage.classList.remove('dragging');
    
    // 드래그 종료 시 토끼 이미지 숨김 및 소리 중지
    if (sleepbuImage) {
        sleepbuImage.classList.remove('show');
        // peek 클래스를 다시 추가 (이전에 있었던 경우)
        if (sleepbuImage.dataset.hadPeek === 'true') {
            setTimeout(() => {
                sleepbuImage.classList.add('peek');
                sleepbuImage.dataset.hadPeek = '';
            }, 100);
        }
    }
    
    // shake 클래스를 다시 추가 (이전에 있었던 경우)
    if (carpetImage.dataset.hadShake === 'true') {
        setTimeout(() => {
            carpetImage.classList.add('shake');
            carpetImage.dataset.hadShake = '';
        }, 100);
    }
    
    stopSnoringSound();
    
    // Reset position with smooth transition
    setTimeout(() => {
        carpetImage.style.transform = 'translate(0, 0) scale(1)';
    }, 100);
}

function moveCarpet() {
    const carpetImage = document.getElementById('carpet-image');
    carpetImage.classList.add('moving');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        carpetImage.classList.remove('moving');
    }, 1000);
}

// Donation Button
function goToDonation() {
    window.location.href = 'donation.html';
}

// ================== 카드 슬라이더 ==================
function initCardSlider() {
    const slider = document.getElementById('cardSlider');
    const prevBtn = document.getElementById('cardPrevBtn');
    const nextBtn = document.getElementById('cardNextBtn');
    const sliderText = document.getElementById('cardSliderText');
    const indicators = document.querySelectorAll('.card-indicators .indicator');
    
    console.log('카드 슬라이더 초기화:', { slider, prevBtn, nextBtn, indicators });
    
    if (!slider || !prevBtn || !nextBtn) {
        console.log('카드 슬라이더 요소를 찾을 수 없습니다');
        return;
    }

    let currentSlide = 0;
    const totalSlides = 4; // 4개 슬라이드 (0, 1, 2, 3)
    const cardsPerSlide = 2; // 한 번에 보이는 카드 수

    function updateSlider() {
        if (window.innerWidth <= 550) {
            // 폰 버전: 모든 카드를 세로로 보여주고 슬라이드 비활성화
            slider.style.transform = 'none';
            const cardImages = slider.querySelectorAll('.card-image');
            cardImages.forEach((card) => {
                card.style.display = 'block';
                card.style.width = '100%';
                card.style.margin = '10px auto';
            });
        } else {
            // 데스크톱/모바일 버전: 슬라이드 방식
            let translateX;
            if (window.innerWidth <= 768) {
                // 모바일 버전: 48% 너비 + gap 고려
                translateX = -currentSlide * 50;
            } else {
                // 데스크톱 버전: 48% 너비 + gap 고려
                translateX = -currentSlide * 50;
            }
            
            slider.style.transform = `translateX(${translateX}%)`;
            
            // 카드 이미지들을 원래대로 복원
            const cardImages = slider.querySelectorAll('.card-image');
            cardImages.forEach((card) => {
                card.style.display = '';
                card.style.width = '';
                card.style.margin = '';
            });
        }
        
        console.log('카드 슬라이드 업데이트:', { 
            currentSlide, 
            screenWidth: window.innerWidth
        });
        
        // 슬라이더 텍스트 업데이트
        sliderText.textContent = `${currentSlide + 1} / ${totalSlides}`;
        
        // 인디케이터 업데이트
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
        
        // 버튼 상태 업데이트
        prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.5' : '1';
    }

    function nextSlide() {
        console.log('다음 카드 슬라이드 클릭:', currentSlide);
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    }

    function prevSlide() {
        console.log('이전 카드 슬라이드 클릭:', currentSlide);
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }

    function goToSlide(slideIndex) {
        console.log('카드 슬라이드로 이동:', slideIndex);
        if (slideIndex >= 0 && slideIndex < totalSlides) {
            currentSlide = slideIndex;
            updateSlider();
        }
    }

    // 버튼 이벤트
    nextBtn.onclick = function() {
        console.log('다음 카드 버튼 클릭됨');
        nextSlide();
    };
    
    prevBtn.onclick = function() {
        console.log('이전 카드 버튼 클릭됨');
        prevSlide();
    };

    // 인디케이터 이벤트
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });

    // 화면 크기 변경 시 슬라이드 위치 재조정
    window.addEventListener('resize', () => {
        updateSlider();
    });

    // 초기 상태 설정
    updateSlider();
    
    console.log('카드 슬라이더 초기화 완료');
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    new DraggableManager();
    new MainLogoManager();
    new HamburgerManager();
    new FooterLogoManager();
    new TextSliderManager();
    
    // 요소가 존재하는 경우에만 초기화
    const carpetImage = document.getElementById('carpet-image');
    if (carpetImage) {
        initCarpetDrag();
        initCarpetRotation();
    }
    
    const hashtagAnimation = new HashtagAnimationManager();
    hashtagAnimation.init();
    
    // 카드 슬라이더 초기화 (요소가 있는 경우에만)
    const cardSlider = document.getElementById('cardSlider');
    if (cardSlider) {
        initCardSlider();
    }
    
    // 카펫 섹션 진입 시 토끼가 올라오고 카펫이 움찔하는 효과
    initCarpetSectionPeek();
    
    // 램프 클릭 시 글로우 토글 및 다크모드 전환
    const lampItem = document.querySelector('.item-23');
    if (lampItem) {
        lampItem.addEventListener('click', function(e) {
            e.stopPropagation(); // 드래그 이벤트와 충돌 방지
            this.classList.toggle('glow-off');
            
            // 글로우가 꺼지면 배너만 다크모드, 켜지면 라이트모드
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                if (this.classList.contains('glow-off')) {
                    mainContent.classList.add('dark-mode');
                    document.body.classList.add('banner-dark-mode');
                } else {
                    mainContent.classList.remove('dark-mode');
                    document.body.classList.remove('banner-dark-mode');
                }
            }
        });
    }
    
});

// Carpet 애니메이션 기능
function initCarpetRotation() {
    const carpetImage = document.querySelector('.about-carpet-image');
    
    // 요소가 없으면 함수 종료
    if (!carpetImage) {
        return;
    }
    
    carpetImage.addEventListener('click', function() {
            // 이미 애니메이션 중이면 무시
            if (this.classList.contains('bouncing') || 
                this.classList.contains('wiggling') || 
                this.classList.contains('floating') || 
                this.classList.contains('pulsing')) {
                return;
            }
            
            // 랜덤 애니메이션 선택
            const animations = ['bouncing', 'wiggling', 'floating', 'pulsing'];
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
            
            // 선택된 애니메이션 클래스 추가
            this.classList.add(randomAnimation);
            
            // 애니메이션 완료 후 클래스 제거
            setTimeout(() => {
                this.classList.remove(randomAnimation);
            }, 800); // 애니메이션 시간에 맞춰 조정
        });
}

// 카펫 섹션 진입 시 토끼가 올라오고 카펫이 움찔하는 효과 (반복)
function initCarpetSectionPeek() {
    const carpetSection = document.querySelector('.carpet-section');
    const sleepbuImage = document.getElementById('sleepbu-image');
    const carpetImage = document.getElementById('carpet-image');
    let hasTriggered = false; // 한 번만 실행되도록

    if (carpetSection && sleepbuImage && carpetImage) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasTriggered) {
                    hasTriggered = true;
                    
                    // 토끼가 올라와서 귀 보이게 (반복)
                    setTimeout(() => {
                        sleepbuImage.classList.add('peek');
                    }, 300);
                    
                    // 카펫 움찔 효과 (반복)
                    setTimeout(() => {
                        carpetImage.classList.add('shake');
                    }, 500);
                } else if (!entry.isIntersecting && hasTriggered) {
                    // 섹션을 벗어나면 애니메이션 제거
                    sleepbuImage.classList.remove('peek');
                    carpetImage.classList.remove('shake');
                    hasTriggered = false; // 다시 진입할 수 있도록
                }
            });
        }, {
            threshold: 0.3 // 섹션의 30%가 보이면 트리거
        });

        observer.observe(carpetSection);
    }
}

// ==================== 헌금하기 페이지 기능 ====================

// 전역 변수
let privacyConsent = false;
let letterData = {
    nickname: '',
    phone: '',
    content: '',
    timestamp: ''
};

// 단계 전환
function goToStep(stepId) {
    // 모든 단계 숨기기
    document.querySelectorAll('.donation-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 선택한 단계 보이기
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

// 뒤로 가기
function goBack(stepId) {
    goToStep(stepId);
}

// 개인정보 동의 설정
function setPrivacyConsent(consent) {
    privacyConsent = consent;
    const phoneField = document.getElementById('phone-field');
    
    if (consent) {
        phoneField.style.display = 'block';
    } else {
        phoneField.style.display = 'none';
    }
    
    goToStep('step-letter');
}

// 편지 데이터 저장
function saveLetterData() {
    letterData.nickname = document.getElementById('nickname').value;
    letterData.content = document.getElementById('letter-content').value;
    letterData.timestamp = new Date().toISOString();
    
    if (privacyConsent) {
        letterData.phone = document.getElementById('phone').value;
    }
}

// 헌금하기 (실시간) 선택
function sendToLive() {
    saveLetterData();
    
    // 실시간 메시지 영역에 추가
    const liveMessages = document.getElementById('live-messages');
    const messageHTML = `
        <div class="message-item">
            <div class="message-nickname">${letterData.nickname}</div>
            <div class="message-time">${formatTime(letterData.timestamp)}</div>
            <div class="message-content">${letterData.content}</div>
        </div>
    `;
    
    liveMessages.insertAdjacentHTML('afterbegin', messageHTML);
    goToStep('step-live');
}

// RIP MIND 선택
function sendToRipMind() {
    saveLetterData();
    
    // 전송 중 화면 표시
    goToStep('step-sending');
    
    // 2초 후 RIP MIND로 이동
    setTimeout(() => {
        // RIP MIND 목록에 추가 (내용은 숨김)
        const ripmindList = document.getElementById('ripmind-list');
        const itemHTML = `
            <div class="ripmind-item">
                <div class="ripmind-nickname">${letterData.nickname}</div>
                <div class="ripmind-time">${formatTime(letterData.timestamp)}</div>
            </div>
        `;
        
        ripmindList.insertAdjacentHTML('afterbegin', itemHTML);
        goToStep('step-ripmind');
    }, 2000);
}

// 시간 포맷 함수
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// Popup 기능 - 2초 후 표시, 3분 후 사라지고 30초 후 다시 나타남
document.addEventListener('DOMContentLoaded', function() {
    const popupContainer = document.getElementById('popupContainer');
    let animationInterval;
    
    if (popupContainer) {
        function startAnimationCycle() {
            // 애니메이션 시작 (10초 동안)
            popupContainer.classList.add('animate');
            
            setTimeout(() => {
                // 애니메이션 중지
                popupContainer.classList.remove('animate');
                
                // 30초 후 다시 애니메이션 시작
                setTimeout(() => {
                    startAnimationCycle();
                }, 30000); // 30초
            }, 10000); // 10초 동안 애니메이션
        }
        
        function showPopup() {
            popupContainer.classList.add('show');
            
            // 팝업이 나타난 후 2초 뒤부터 애니메이션 사이클 시작
            setTimeout(() => {
                startAnimationCycle();
            }, 2000);
            
            // 3분(180초) 후 팝업 숨김
            setTimeout(() => {
                popupContainer.classList.remove('show');
                popupContainer.classList.remove('animate');
                
                // 애니메이션 인터벌 정리
                if (animationInterval) {
                    clearInterval(animationInterval);
                }
                
                // 30초 후 다시 팝업 표시 (재귀 호출)
                setTimeout(() => {
                    showPopup();
                }, 30000); // 30초
            }, 180000); // 3분 (180초)
        }
        
        // 페이지 로드 후 2초 뒤 팝업 표시 시작
        setTimeout(() => {
            showPopup();
        }, 2000);
    }
});

// 토끼 이미지 숨쉬는 소리 (드르렁쿨) - 드래그 중일 때만 재생
let snoringAudio = null;
let snoringTimeout = null;
let volumeInterval = null;

function startSnoringSound() {
    // 이미 재생 중이거나 대기 중이면 중복 방지
    if (snoringAudio && !snoringAudio.paused) return;
    if (snoringTimeout) return;
    
    // 0.5초 후 소리 재생
    snoringTimeout = setTimeout(() => {
        // MP3 파일로 드르렁쿨 소리 재생
        snoringAudio = new Audio('sound/male-snoring-297875.mp3');
        snoringAudio.loop = true;
        snoringAudio.volume = 0.01; // 처음엔 매우 작게 시작
        snoringAudio.play().catch(error => {
            console.log('소리 재생 실패:', error);
        });
        snoringTimeout = null;
        
        // 볼륨을 점진적으로 증가 (0.01에서 0.5까지 2초 동안)
        let currentVolume = 0.01;
        const targetVolume = 0.5;
        const duration = 2000; // 2초
        const steps = 50; // 50단계로 나눔
        const volumeStep = (targetVolume - currentVolume) / steps;
        const stepDuration = duration / steps;
        
        volumeInterval = setInterval(() => {
            currentVolume += volumeStep;
            if (currentVolume >= targetVolume) {
                currentVolume = targetVolume;
                clearInterval(volumeInterval);
                volumeInterval = null;
            }
            if (snoringAudio) {
                snoringAudio.volume = currentVolume;
            }
        }, stepDuration);
    }, 500); // 0.5초 지연
}

function stopSnoringSound() {
    // 대기 중인 타임아웃 취소
    if (snoringTimeout) {
        clearTimeout(snoringTimeout);
        snoringTimeout = null;
    }
    
    // 볼륨 증가 인터벌 정리
    if (volumeInterval) {
        clearInterval(volumeInterval);
        volumeInterval = null;
    }
    
    // 재생 중인 소리 중지
    if (snoringAudio) {
        snoringAudio.pause();
        snoringAudio.currentTime = 0;
        snoringAudio.volume = 0.5; // 다음 재생을 위해 볼륨 초기화
    }
}

