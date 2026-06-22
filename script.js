/* ==========================================================================
   ELEVATE — Interactive Features
   Depends on: firebase-config.js, posts.js, auth.js
   ========================================================================== */

(function () {
  'use strict';

  // ---- Dark Mode Toggle ----
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check localStorage or system preference
  if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }

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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Sticky Header Shadow on Scroll ----
  const header = document.getElementById('site-header');
  if (header) {
    let ticking = false;
    function updateHeader() {
      header.classList.toggle('scrolled', window.scrollY > 10);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(updateHeader); ticking = true; }
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
        setTimeout(() => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; }, 300);
      } else {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden';
        void mobileNav.offsetWidth;
        mobileNav.style.opacity = '1';
        mobileNav.style.transform = 'translateY(0)';
      }
    });
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
      setTimeout(() => { if (searchInput) searchInput.focus(); }, 300);
    }
  }
  function closeSearch() {
    if (searchOverlay) {
      searchOverlay.classList.remove('open');
      document.body.style.overflow = '';
      if (searchInput) searchInput.value = '';
    }
  }

  if (searchToggle) searchToggle.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  });

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  }

  // ---- Reading Progress Bar (Article Page) ----
  const progressBar = document.getElementById('reading-progress');
  const articleBody = document.getElementById('article-body');

  if (progressBar && articleBody) {
    let progressTicking = false;
    function updateProgress() {
      const rect = articleBody.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      const end = start + articleBody.offsetHeight;
      const scrolled = window.scrollY + window.innerHeight;
      const pct = Math.min(Math.max(((scrolled - start) / (end - start)) * 100, 0), 100);
      progressBar.style.width = pct + '%';
      progressTicking = false;
    }
    window.addEventListener('scroll', () => {
      if (!progressTicking) { window.requestAnimationFrame(updateProgress); progressTicking = true; }
    });
    updateProgress();
  }

  // ---- Newsletter Form ----
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterBtn = document.getElementById('newsletter-submit');
  if (newsletterForm && newsletterBtn) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const orig = newsletterBtn.textContent;
      newsletterBtn.textContent = '✓ Subscribed';
      newsletterBtn.style.background = 'var(--color-accent-hover)';
      setTimeout(() => { newsletterBtn.textContent = orig; newsletterBtn.style.background = ''; newsletterForm.reset(); }, 2500);
    });
  }

  // ---- Smooth Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const h = header ? header.offsetHeight : 0;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - h - 20, behavior: 'smooth' });
      }
    });
  });

  // ---- Lazy Image Fade ----
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    if (img.complete) { img.style.opacity = '1'; }
    else {
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '1'; });
    }
  });

  // =========================================================================
  //  DYNAMIC POST GRID (Homepage)
  // =========================================================================
  const postGrid = document.getElementById('post-grid');
  const heroCard = document.getElementById('hero-card');

  if (postGrid && typeof ElevatePosts !== 'undefined') {
    loadDynamicPosts();
  }

  async function loadDynamicPosts() {
    try {
      const allPosts = await ElevatePosts.getAllPosts();

      // Featured post = first seed-1 post
      const featured = allPosts.find(p => p.isFeatured) || allPosts[0];

      // Update hero if we have a dynamic featured
      if (heroCard && featured) {
        const heroImg = heroCard.querySelector('.hero-image');
        const heroTitle = heroCard.querySelector('.hero-title');
        const heroExcerpt = heroCard.querySelector('.hero-excerpt');
        const heroMeta = heroCard.querySelector('.hero-meta');

        if (heroImg) heroImg.src = featured.image || 'images/hero-featured.png';
        if (heroTitle) heroTitle.textContent = featured.title;
        if (heroExcerpt) heroExcerpt.textContent = featured.excerpt;
        if (heroMeta) {
          heroMeta.innerHTML = `
            <span>${featured.authorName}</span>
            <span class="dot"></span>
            <span>${ElevatePosts.formatDate(featured.date)}</span>
            <span class="dot"></span>
            <span>${featured.readTime}</span>
          `;
        }
        heroCard.href = 'article.html?id=' + featured.id;
      }

      // Get non-featured posts
      const gridPosts = allPosts.filter(p => p !== featured);

      // Clear existing grid
      postGrid.innerHTML = '';

      // Render post cards with native ads every 4th
      gridPosts.forEach((post, index) => {
        // Insert In-Feed AdSense block after the 3rd and 7th posts
        if (index === 2 || index === 6) {
          postGrid.innerHTML += `
            <div class="ad-slot-in-feed-card" style="text-align:center;">
              <ins class="adsbygoogle"
                   style="display:block"
                   data-ad-format="fluid"
                   data-ad-layout-key="-fb+5w+4e-db+86"
                   data-ad-client="ca-pub-6732536198242513"
                   data-ad-slot="1234567890"></ins>
            </div>`;
        }

        postGrid.innerHTML += renderPostCard(post);
      });

      // Trigger reveal animations on new elements
      setTimeout(() => {
        postGrid.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        // Initialize AdSense for dynamically inserted ads
        postGrid.querySelectorAll('.adsbygoogle').forEach(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {}
        });
      }, 100);

    } catch (err) {
      console.warn('Error loading posts:', err);
    }
  }

  function renderPostCard(post) {
    const dateStr = ElevatePosts.formatDate(post.date);
    const link = 'article.html?id=' + post.id;
    const imgSrc = post.image || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#f5f5f5"><rect width="400" height="300"/><text x="50%" y="50%" fill="#ccc" font-size="14" text-anchor="middle" dy=".3em">No Image</text></svg>');
    const sponsoredBadge = post.isSponsored ? '<span class="sponsored-badge">Sponsored</span>' : '';

    return `
      <article class="post-card reveal is-visible">
        <a href="${link}">
          <div class="post-card-image-wrapper">
            ${sponsoredBadge}
            <img src="${imgSrc}" alt="${post.title}" class="post-card-image" loading="lazy">
          </div>
        </a>
        <span class="post-card-category">${post.category}</span>
        <a href="${link}"><h3 class="post-card-title">${post.title}</h3></a>
        <p class="post-card-excerpt">${post.excerpt}</p>
        <div class="post-card-footer">
          <time class="post-card-date">${dateStr}</time>
          <a href="${link}" class="read-more">Read <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></a>
        </div>
      </article>
    `;
  }

  // renderNativeAd replaced by dynamic in-feed ads from Firestore (see ads.js)

  // =========================================================================
  //  DYNAMIC ARTICLE PAGE
  // =========================================================================
  const articleMain = document.getElementById('article-main');

  if (articleMain && typeof ElevatePosts !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (postId) {
      loadArticle(postId);
    }
    // If no id, show the default hardcoded article (seed-1)
  }

  async function loadArticle(id) {
    try {
      const post = await ElevatePosts.getPostById(id);
      if (!post) {
        articleMain.innerHTML = '<div style="text-align:center;padding:4rem 0;"><h2>Post not found</h2><p style="color:var(--color-text-secondary);margin-top:1rem;">This article may have been removed.</p><a href="index.html" style="color:var(--color-accent);margin-top:1rem;display:inline-block;">← Back to Home</a></div>';
        return;
      }

      // Update page title
      document.title = post.title + ' — Elevate';

      // Update article header
      const breadcrumb = articleMain.querySelector('.article-breadcrumb');
      if (breadcrumb) {
        breadcrumb.innerHTML = `
          <a href="index.html">Home</a><span class="sep">/</span>
          <a href="categories.html">${post.category}</a><span class="sep">/</span>
          <span>${post.title.substring(0, 40)}...</span>
        `;
      }

      const catBadge = articleMain.querySelector('.article-category');
      if (catBadge) catBadge.textContent = post.category;

      const titleEl = articleMain.querySelector('.article-title');
      if (titleEl) titleEl.textContent = post.title;

      const subtitleEl = articleMain.querySelector('.article-subtitle');
      if (subtitleEl) subtitleEl.textContent = post.excerpt;

      const avatarEl = articleMain.querySelector('.article-author-avatar');
      if (avatarEl) avatarEl.textContent = post.authorInitials || ElevatePosts.getInitials(post.authorName);

      const nameEl = articleMain.querySelector('.article-author-name');
      if (nameEl) nameEl.textContent = post.authorName;

      const dateEl = articleMain.querySelector('time');
      if (dateEl) {
        dateEl.textContent = ElevatePosts.formatDate(post.date);
        dateEl.setAttribute('datetime', post.date);
      }

      // Update read time
      const metaSpans = articleMain.querySelectorAll('.article-meta span');
      metaSpans.forEach(span => {
        if (span.textContent.includes('min read')) span.textContent = post.readTime;
      });

      // Update featured image
      const featImg = articleMain.querySelector('.article-featured-image');
      if (featImg) {
        if (post.image) {
          featImg.src = post.image;
          featImg.alt = post.title;
        } else {
          featImg.style.display = 'none';
        }
      }

      // Update body
      const bodyEl = document.getElementById('article-body');
      if (bodyEl && post.body) {
        bodyEl.innerHTML = post.body;

        // Re-inject mobile in-article ads
        const paragraphs = bodyEl.querySelectorAll('p');
        if (paragraphs.length > 4) {
          const adHtml = `<div class="ad-in-article ad-in-article-mobile-only"><span class="ad-label">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6732536198242513" data-ad-slot="XXXXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
          paragraphs[Math.floor(paragraphs.length / 3)].insertAdjacentHTML('afterend', adHtml);
          if (paragraphs.length > 8) {
            paragraphs[Math.floor(paragraphs.length * 2 / 3)].insertAdjacentHTML('afterend', adHtml);
          }
        }
      }

      // Update tags based on category
      const tagsEl = document.getElementById('article-tags');
      if (tagsEl) {
        tagsEl.innerHTML = `
          <a href="categories.html" class="article-tag">${post.category}</a>
          <a href="categories.html" class="article-tag">Elevate</a>
        `;
      }

    } catch (err) {
      console.error('Error loading article:', err);
    }
  }

})();
