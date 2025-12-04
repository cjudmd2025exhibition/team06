// ==================== 햄버거 메뉴 기능 ====================

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

// 전화번호 필드 표시
function showPhoneField() {
    const phoneField = document.getElementById('phone-field');
    phoneField.style.display = 'block';
    privacyConsent = true; // 개인정보 동의로 설정
    goToStep('step-letter');
}

// 전화번호 필드 숨김
function hidePhoneField() {
    const phoneField = document.getElementById('phone-field');
    phoneField.style.display = 'none';
    privacyConsent = false; // 개인정보 비동의로 설정
    
    // nametell 배경 이미지를 name.webp로 변경
    const stepLetter = document.getElementById('step-letter');
    if (stepLetter) {
        const beforeElement = window.getComputedStyle(stepLetter, ':before');
        stepLetter.style.setProperty('--bg-image', 'url("../img_donation/name.webp")');
        
        // CSS를 동적으로 변경
        const style = document.createElement('style');
        style.textContent = `
            #step-letter::before {
                background-image: url('../img_donation/name.webp') !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    goToStep('step-letter');
}

// 개인정보 동의 체크 확인
function checkPrivacyConsent() {
    const nickname = document.getElementById('nickname');
    const phoneField = document.getElementById('phone-field');
    const checkbox = document.querySelector('.privacy-checkbox');
    
    // 이름을 입력하지 않은 경우
    if (!nickname.value.trim()) {
        alert('별명을 입력해주세요.');
        return false;
    }
    
    // 전화번호 필드가 표시된 경우
    if (phoneField && phoneField.style.display !== 'none') {
        const phone = document.getElementById('phone');
        // 전화번호를 입력하지 않은 경우
        if (!phone.value.trim()) {
            alert('전화번호를 입력해주세요.');
            return false;
        }
        // 체크박스가 체크되지 않은 경우
        if (checkbox && !checkbox.checked) {
            alert('개인정보 수집·이용 동의를 체크해주세요.');
            return false;
        }
    }
    
    goToStep('step-letter-content');
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

// 헌금하기 (SMS 전송) 선택
async function sendToLive() {
    saveLetterData();
    
    // 로딩 화면 표시
    goToStep('step-sending-donation');
    
    // SMS 전송 (전화번호가 입력된 경우만)
    if (letterData.phone) {
        try {
            const response = await fetch('http://localhost:3000/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: letterData.phone,
                    message: letterData.content,
                    nickname: letterData.nickname
                })
            });
            
            if (response.ok) {
                console.log('SMS 전송 성공');
            }
        } catch (error) {
            console.error('SMS 전송 실패:', error);
        }
    }
    
    // 3초 후 완료 화면으로 이동
    setTimeout(() => {
        goToStep('step-donation-complete');
    }, 3000);
}

// RIP MIND 데이터 저장 (localStorage)
function saveRipMindData() {
    const existingData = JSON.parse(localStorage.getItem('ripmind') || '[]');
    
    const newItem = {
        id: Date.now().toString(),
        nickname: letterData.nickname,
        phone: letterData.phone || '',
        content: letterData.content,
        timestamp: letterData.timestamp
    };
    
    existingData.push(newItem);
    localStorage.setItem('ripmind', JSON.stringify(existingData));
}

// RIP MIND 목록 불러오기 (localStorage)
function loadRipMindList() {
    const ripmindList = document.getElementById('ripmind-list');
    
    try {
        const data = JSON.parse(localStorage.getItem('ripmind') || '[]');
        
        ripmindList.innerHTML = ''; // 기존 목록 클리어
        
        // 데이터가 없으면 메시지 표시
        if (data.length === 0) {
            ripmindList.innerHTML = '<p style="text-align: center; color: #573722; font-size: 18px;">아직 묻힌 편지가 없습니다.</p>';
            return;
        }
        
        // 최신순으로 정렬
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
            // 각 아이템을 목록에 추가
            sortedData.forEach((item, index) => {
                const nickname = item.nickname.substring(0, 2); // 최대 2글자만 표시
                const itemHTML = `
                    <div class="ripmind-item" data-index="${index}" data-nickname="${item.nickname || ''}" data-timestamp="${item.timestamp}" data-content="${(item.content || '').replace(/"/g, '&quot;')}" data-phone="${item.phone || ''}">
                        <span class="ripmind-nickname">${nickname}</span>
                        <span class="ripmind-time">-${formatTime(item.timestamp)}</span>
                    </div>
                `;
                ripmindList.insertAdjacentHTML('beforeend', itemHTML);
            });
            
            // 첫 번째 항목 자동 선택
            const firstItem = ripmindList.querySelector('.ripmind-item');
            if (firstItem) {
                firstItem.classList.add('selected');
            }
            
            // 클릭 이벤트 추가 - 상세 모달 열기
            const items = ripmindList.querySelectorAll('.ripmind-item');
            items.forEach((item) => {
                item.addEventListener('click', function() {
                    // 모든 항목에서 selected 클래스 제거
                    items.forEach(i => i.classList.remove('selected'));
                    // 클릭한 항목에만 selected 클래스 추가
                    this.classList.add('selected');
                    
                    // 클릭한 아이템의 데이터 가져오기
                    const clickedNickname = this.getAttribute('data-nickname');
                    const clickedTimestamp = this.getAttribute('data-timestamp');
                    const clickedContent = this.getAttribute('data-content') || '';
                    const clickedPhone = this.getAttribute('data-phone') || '';
                    
                    // 상세 모달에 데이터 전달
                    showRipMindDetail({
                        nickname: clickedNickname,
                        timestamp: clickedTimestamp,
                        content: clickedContent,
                        phone: clickedPhone
                    });
                });
            });
    } catch (error) {
        console.error('RIP MIND 목록 불러오기 실패:', error);
        ripmindList.innerHTML = '<p style="text-align: center; color: #573722; font-size: 18px;">목록을 불러올 수 없습니다.</p>';
    }
}

// RIP MIND 선택
function sendToRipMind() {
    saveLetterData();
    
    // 전송 중 화면 표시
    goToStep('step-sending');
    
    // localStorage에 데이터 저장
    saveRipMindData();
    
    // 2초 후 RIP MIND로 이동
    setTimeout(() => {
        loadRipMindList();
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
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

// 카운트 표시 업데이트 함수
function updateCharCountDisplay(input) {
    const charCountDisplay = document.getElementById('char-count-display');
    if (charCountDisplay) {
        const currentLength = input.value.length;
        charCountDisplay.textContent = `(${currentLength}자 / 6자)`;
    }
}

// placeholder 글자 수 업데이트 함수
function updatePlaceholder(input) {
    const currentLength = input.value.length;
    input.placeholder = `별명을 입력하세요 (${currentLength}자 / 6자)`;
}


// 편지 내용 전체 삭제
function clearLetterContent() {
    const letterTextarea = document.getElementById('letter-content');
    if (letterTextarea) {
        letterTextarea.value = '';
        letterTextarea.focus();
    }
}

// RIP MIND 상세 모달 표시
function showRipMindDetail(itemData) {
    // 텍스트 업데이트
    const nicknameEl = document.getElementById('ripmind-detail-nickname');
    const timeEl = document.getElementById('ripmind-detail-time');
    
    if (nicknameEl) {
        nicknameEl.textContent = `${itemData.nickname}님의RIP MIND`;
    }
    
    if (timeEl) {
        timeEl.textContent = `-${formatTime(itemData.timestamp)}부터`;
    }
    
    // 모달 표시
    const modal = document.getElementById('ripmind-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// RIP MIND 모달 닫기
function closeRipMindModal() {
    const modal = document.getElementById('ripmind-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}


// 모달 배경 클릭 시 닫기
document.addEventListener('click', function(event) {
    const modal = document.getElementById('ripmind-modal');
    if (modal && event.target === modal) {
        closeRipMindModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeRipMindModal();
    }
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    new HamburgerManager();
    
    // URL 파라미터 확인하여 해당 스텝으로 이동
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam === 'ripmind') {
        goToStep('step-ripmind');
        loadRipMindList();
        
        // 헤더 링크로 들어온 경우 "처음으로" 버튼 숨기기
        const ripmindButtonGroup = document.querySelector('.ripmind-button-group');
        if (ripmindButtonGroup) {
            ripmindButtonGroup.style.display = 'none';
        }
    }
    
    // RIP MIND 페이지가 활성화될 때 목록 불러오기
    const ripmindStep = document.getElementById('step-ripmind');
    if (ripmindStep) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (ripmindStep.classList.contains('active')) {
                        loadRipMindList();
                    }
                }
            });
        });
        observer.observe(ripmindStep, { attributes: true });
    }
    
    // RIP MIND 모달 닫기 버튼 이벤트 리스너 추가
    const closeBtn = document.querySelector('.ripmind-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeRipMindModal();
        });
    }
});




