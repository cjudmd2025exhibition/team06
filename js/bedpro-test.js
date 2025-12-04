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
        
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });
        
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
        document.body.style.overflow = 'hidden';
    }
}

// ==================== 테스트 기능 ====================

// 테스트 질문
const questions = [
    "일단 계획했던 시간보다 더 늦게 잠자리에 든다.",
    "종종 잠자리에 들어가야 하는 시간에도 계속해서 다른 일들을 한다.",
    "잠자리에 들어가려고 해도 다른 것들에 쉽게 주의를 뺏긴다.",
    "제 시간에 잠자리에 들어가지 않는다.",
    "만약 아침에 일찍 일어나야 한다면, 잠자리에도 일찍 들어간다.",
    "잠들기 전에 휴대폰이나 태블릿을 사용하는 시간이 길다.",
    "내일 중요한 일이 있어도 밤늦게까지 깨어있는다.",
    "잠자리에 누워서도 계속 생각하거나 걱정이 많다."
];

// 테스트 상태
let currentQuestion = 0;
let answers = [];
let selectedAnswer = null;

// 화면 전환
function showScreen(screenId) {
    document.querySelectorAll('.test-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 테스트 시작
function startTest() {
    currentQuestion = 0;
    answers = [];
    selectedAnswer = null;
    showScreen('screen-test');
    loadQuestion();
}

// 질문 로드
function loadQuestion() {
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // 질문 표시
    questionNumber.textContent = `TEST ${currentQuestion + 1}`;
    questionText.textContent = questions[currentQuestion];
    
    // 진행률 업데이트
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
    
    // 이전 선택 초기화
    document.querySelectorAll('.emoji-option').forEach((option, index) => {
        option.classList.remove('selected');
        const img = option.querySelector('.emoji-img');
        img.src = `img_bedpro/emoji${index + 1}.webp`;
    });
    selectedAnswer = null;
    
    // 이전 답변이 있으면 표시
    if (answers[currentQuestion]) {
        selectedAnswer = answers[currentQuestion];
        document.querySelectorAll('.emoji-option').forEach((option, index) => {
            if (parseInt(option.dataset.value) === selectedAnswer) {
                option.classList.add('selected');
                const img = option.querySelector('.emoji-img');
                img.src = `img_bedpro/c_emoji${index + 1}.png`;
            }
        });
    }
}

// 이모지 선택
document.addEventListener('DOMContentLoaded', () => {
    new HamburgerManager();
    
    const emojiOptions = document.querySelectorAll('.emoji-option');
    emojiOptions.forEach((option, index) => {
        option.addEventListener('click', function() {
            // 모든 선택 해제 및 이미지 원래대로
            emojiOptions.forEach((opt, idx) => {
                opt.classList.remove('selected');
                const img = opt.querySelector('.emoji-img');
                img.src = `img_bedpro/emoji${idx + 1}.webp`;
            });
            
            // 현재 옵션 선택 및 이미지 변경
            this.classList.add('selected');
            const img = this.querySelector('.emoji-img');
            img.src = `img_bedpro/c_emoji${index + 1}.png`;
            selectedAnswer = parseInt(this.dataset.value);
        });
    });
});

// 다음 질문
function nextQuestion() {
    if (selectedAnswer === null) {
        alert('답변을 선택해주세요.');
        return;
    }
    
    // 답변 저장
    answers[currentQuestion] = selectedAnswer;
    
    // 마지막 질문이면 결과 계산
    if (currentQuestion === questions.length - 1) {
        calculateResult();
    } else {
        // 다음 질문으로
        currentQuestion++;
        loadQuestion();
    }
}

// 이전 질문
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    } else {
        showScreen('screen-start');
    }
}

// 결과 계산
function calculateResult() {
    // 총점 계산 (8~40점)
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    
    // 점수 구간별 결과
    let resultScreen;
    if (totalScore <= 18) {
        // 낮은 점수 (8~18점) - 평균 2.25점 이하
        resultScreen = 'screen-result-low';
    } else if (totalScore <= 29) {
        // 중간 점수 (19~29점) - 평균 2.375~3.625점
        resultScreen = 'screen-result-mid';
    } else {
        // 높은 점수 (30~40점) - 평균 3.75점 이상
        resultScreen = 'screen-result-high';
    }
    
    showScreen(resultScreen);
}

// 테스트 재시작
function restartTest() {
    showScreen('screen-start');
    currentQuestion = 0;
    answers = [];
    selectedAnswer = null;
}

// 결과에서 테스트로 돌아가기
function goBackToTest() {
    // 마지막 질문으로 돌아가기
    currentQuestion = questions.length - 1;
    loadQuestion();
    showScreen('screen-test');
}

