
export function initializeHeaderModals() {
  const notificationWrapper = document.querySelector('.notification-wrapper');
  const notificationModal = document.querySelector('.notification-modal');
  
  if (notificationWrapper && notificationModal) {
    let notificationTimeout;
    
    notificationWrapper.addEventListener('mouseenter', () => {
      clearTimeout(notificationTimeout);
      notificationModal.style.opacity = '1';
      notificationModal.style.visibility = 'visible';
      notificationModal.style.transform = 'translateY(0)';
    });
    
    notificationWrapper.addEventListener('mouseleave', () => {
      notificationTimeout = setTimeout(() => {
        notificationModal.style.opacity = '0';
        notificationModal.style.visibility = 'hidden';
        notificationModal.style.transform = 'translateY(-10px)';
      }, 100);
    });
  }
  
  // 프로필 모달
  const profileWrapper = document.querySelector('.profile-wrapper');
  const profileModal = document.querySelector('.profile-modal');
  
  if (profileWrapper && profileModal) {
    let profileTimeout;
    
    profileWrapper.addEventListener('mouseenter', () => {
      clearTimeout(profileTimeout);
      profileModal.style.opacity = '1';
      profileModal.style.visibility = 'visible';
      profileModal.style.transform = 'translateY(0)';
    });
    
    profileWrapper.addEventListener('mouseleave', () => {
      profileTimeout = setTimeout(() => {
        profileModal.style.opacity = '0';
        profileModal.style.visibility = 'hidden';
        profileModal.style.transform = 'translateY(-10px)';
      }, 100);
    });
  }
}

export function initializeHeaderScroll() {
  const header = document.querySelector('.header');
  
  if (!header) return;
  
  function updateHeaderBackground() {
    const scrolled = window.scrollY > 0;
    header.style.backgroundColor = scrolled 
      ? 'rgba(20, 20, 20, 0.95)' 
      : 'rgba(20, 20, 20, 0.8)';
  }
  
  window.addEventListener('scroll', updateHeaderBackground);
  updateHeaderBackground(); // 초기 상태 설정
}
