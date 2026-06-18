/* ==========================================================================
   ELEVATE — Interactive Features
   ========================================================================== */

(function () {
  'use strict';

  // ---- Intersection Observer for Reveal Animations ----
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show all elements immediately
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Sticky Header Shadow on Scroll ----
  const header = document.getElementById('site-header');

  if (header) {
    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });
  }

  // ---- Mobile Menu Toggle ----
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      menuToggle.classList.toggle('active');

      if (isOpen) {
        mobileNav.style.opacity = '0';
        mobileNav.style.transform = 'translateY(-8px)';
        setTimeout(() => {
          mobileNav.classList.remove('open');
          document.body.style.overflow = '';
        }, 300);
      } else {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Trigger reflow for animation
        void mobileNav.offsetWidth;
        mobileNav.style.opacity = '1';
        mobileNav.style.transform = 'translateY(0)';
      }
    });

    // Close mobile nav when a link is clicked
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Search Overlay ----
  const searchToggle = document.getElementById('search-toggle');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');

  function openSearch() {
    if (searchOverlay) {
      searchOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 300);
    }
  }

  function closeSearch() {
    if (searchOverlay) {
      searchOverlay.classList.remove('open');
      document.body.style.overflow = '';
      if (searchInput) searchInput.value = '';
    }
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', openSearch);
  }

  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  // Close search on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
    // Open search on Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // Close search on overlay background click
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  // ---- Reading Progress Bar (Article Page) ----
  const progressBar = document.getElementById('reading-progress');
  const articleBody = document.getElementById('article-body');

  if (progressBar && articleBody) {
    let progressTicking = false;

    function updateProgress() {
      const articleRect = articleBody.getBoundingClientRect();
      const articleStart = articleRect.top + window.scrollY;
      const articleEnd = articleStart + articleBody.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrolled = window.scrollY + viewportHeight;
      const total = articleEnd - articleStart;
      const current = scrolled - articleStart;

      let percentage = Math.min(Math.max((current / total) * 100, 0), 100);

      progressBar.style.width = percentage + '%';
      progressTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!progressTicking) {
        window.requestAnimationFrame(updateProgress);
        progressTicking = true;
      }
    });

    // Initial calculation
    updateProgress();
  }

  // ---- Newsletter Form (Minimal Feedback) ----
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterBtn = document.getElementById('newsletter-submit');

  if (newsletterForm && newsletterBtn) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const originalText = newsletterBtn.textContent;

      newsletterBtn.textContent = '✓ Subscribed';
      newsletterBtn.style.background = 'var(--color-accent-hover)';

      setTimeout(() => {
        newsletterBtn.textContent = originalText;
        newsletterBtn.style.background = '';
        newsletterForm.reset();
      }, 2500);
    });
  }

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // ---- Lazy Image Loading Enhancement ----
  // Add a subtle fade-in effect when lazy images load
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      img.addEventListener('error', () => {
        img.style.opacity = '1';
      });
    }
  });
})();
