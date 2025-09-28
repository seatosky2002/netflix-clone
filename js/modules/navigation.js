// 네비게이션 기능 모듈
export function initNavigation() {
    // 헤더 스크롤 효과
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // 스크롤 방향에 따른 헤더 숨김/표시
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // 네비게이션 링크 활성화
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 모든 링크에서 active 클래스 제거
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 클릭된 링크에 active 클래스 추가
            link.classList.add('active');
        });
    });
    
    // 검색 기능 (기본 구현)
    const searchBtn = document.querySelector('.nav-right .icon-btn[aria-label="검색"]');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            console.log('검색 기능이 클릭되었습니다.');
            // 실제 검색 기능 구현 가능
        });
    }
    
    // 키즈 모드 토글
    const kidsText = document.querySelector('.kids-text');
    if (kidsText) {
        kidsText.addEventListener('click', () => {
            console.log('키즈 모드가 토글되었습니다.');
            // 키즈 모드 기능 구현 가능
        });
    }
}
