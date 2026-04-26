/* ============================================================
   INNER PAGES — Shared JavaScript
   ============================================================ */

(function () {
  // ---- Detect page theme ----
  const isLight = document.body.classList.contains('page-light');
  const navbar  = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  // ---- Navbar scroll behaviour ----
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (isLight) {
        // Always stay light, just add border on scroll
        navbar.style.background = 'rgba(245,245,240,0.97)';
        if (window.scrollY > 20) {
          navbar.style.borderBottom = '1px solid rgba(17,17,17,0.12)';
        } else {
          navbar.style.borderBottom = '';
        }
      } else {
        // Dark page — stays dark
        navbar.style.background = window.scrollY > 20
          ? 'rgba(10,10,10,0.97)'
          : 'rgba(10,10,10,0.97)';
      }
    }, { passive: true });
  }

  // ---- Hamburger toggle ----
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity  = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          // Animate tech bar fills on technology page
          const fill = e.target.querySelector('.tech-bar-fill');
          if (fill) {
            const target = fill.style.width;
            fill.style.width = '0';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => { fill.style.width = target; });
            });
          }
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }
})();
