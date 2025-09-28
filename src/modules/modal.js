// 모달 기능 모듈
export function initModals() {
    // 알림 모달
    const notificationBtn = document.querySelector('.notification-wrapper .icon-btn');
    const notificationModal = document.querySelector('.notification-modal');
    
    if (notificationBtn && notificationModal) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleModal(notificationModal);
        });
    }
    
    // 프로필 모달
    const profileBtn = document.querySelector('.profile-container');
    const profileModal = document.querySelector('.profile-modal');
    
    if (profileBtn && profileModal) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleModal(profileModal);
        });
    }
    
    // 모달 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        const openModals = document.querySelectorAll('.header-modal.show');
        openModals.forEach(modal => {
            if (!modal.contains(e.target)) {
                closeModal(modal);
            }
        });
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.header-modal.show');
            openModals.forEach(modal => {
                closeModal(modal);
            });
        }
    });
    
    function toggleModal(modal) {
        if (modal.classList.contains('show')) {
            closeModal(modal);
        } else {
            openModal(modal);
        }
    }
    
    function openModal(modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        
        // 애니메이션을 위한 약간의 지연
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }, 10);
    }
    
    function closeModal(modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }, 200);
    }
}
