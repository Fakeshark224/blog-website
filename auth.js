/* ==========================================================================
   ELEVATE — Authentication Module
   Depends on: firebase-config.js (fbAuth, db)
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Inject Auth Modal HTML ---------- */
  function injectAuthModal() {
    if (document.getElementById('auth-overlay')) return;

    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="auth-overlay" id="auth-overlay">
        <div class="auth-modal" id="auth-modal">
          <button class="auth-close" id="auth-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="auth-header">
            <a class="logo" style="font-size:1.5rem;">elev<span>.</span>ate</a>
          </div>

          <div class="auth-tabs" id="auth-tabs">
            <button class="auth-tab active" data-tab="login" id="tab-login">Log In</button>
            <button class="auth-tab" data-tab="signup" id="tab-signup">Sign Up</button>
          </div>

          <div class="auth-error" id="auth-error" style="display:none;"></div>

          <!-- LOGIN FORM -->
          <form class="auth-form" id="login-form">
            <div class="auth-field">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" class="auth-input" placeholder="you@example.com" required autocomplete="email">
            </div>
            <div class="auth-field">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label for="login-password">Password</label>
                <a href="#" id="forgot-password-link" style="font-size:var(--font-size-xs); color:var(--color-text-secondary); text-decoration:underline;">Forgot Password?</a>
              </div>
              <input type="password" id="login-password" class="auth-input" placeholder="Your password" required autocomplete="current-password">
            </div>
            <button type="submit" class="auth-submit-btn" id="login-submit">Log In</button>
          </form>

          <!-- SIGNUP FORM -->
          <form class="auth-form" id="signup-form" style="display:none;">
            <div class="auth-field">
              <label for="signup-name">Full Name</label>
              <input type="text" id="signup-name" class="auth-input" placeholder="Your name" required autocomplete="name">
            </div>
            <div class="auth-field">
              <label for="signup-email">Email</label>
              <input type="email" id="signup-email" class="auth-input" placeholder="you@example.com" required autocomplete="email">
            </div>
            <div class="auth-field">
              <label for="signup-password">Password</label>
              <input type="password" id="signup-password" class="auth-input" placeholder="Min 6 characters" required minlength="6" autocomplete="new-password">
            </div>
            <button type="submit" class="auth-submit-btn" id="signup-submit">Create Account</button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal.firstElementChild);
    bindAuthEvents();
  }

  /* ---------- Event Bindings ---------- */
  function bindAuthEvents() {
    const overlay = document.getElementById('auth-overlay');
    const closeBtn = document.getElementById('auth-close');
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Close modal
    closeBtn.addEventListener('click', hideAuthModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hideAuthModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) hideAuthModal();
    });

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        hideError();

        if (target === 'login') {
          loginForm.style.display = '';
          signupForm.style.display = 'none';
        } else {
          loginForm.style.display = 'none';
          signupForm.style.display = '';
        }
      });
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('login-submit');

      btn.textContent = 'Logging in...';
      btn.disabled = true;

      try {
        await fbAuth.signInWithEmailAndPassword(email, password);
        hideAuthModal();
        loginForm.reset();
      } catch (err) {
        showError(friendlyError(err.code));
      } finally {
        btn.textContent = 'Log In';
        btn.disabled = false;
      }
    });

    // Forgot Password
    document.getElementById('forgot-password-link').addEventListener('click', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email').value;
      const email = prompt('Enter your email address to reset your password:', emailInput);
      if (email) {
        try {
          await fbAuth.sendPasswordResetEmail(email);
          alert('Password reset email sent! Please check your inbox.');
        } catch (err) {
          showError(friendlyError(err.code));
        }
      }
    });

    // Signup
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const btn = document.getElementById('signup-submit');

      btn.textContent = 'Creating account...';
      btn.disabled = true;

      try {
        const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name });

        // Save user profile to Firestore
        await db.collection('users').doc(cred.user.uid).set({
          name: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        hideAuthModal();
        signupForm.reset();
      } catch (err) {
        showError(friendlyError(err.code));
      } finally {
        btn.textContent = 'Create Account';
        btn.disabled = false;
      }
    });
  }

  /* ---------- Modal Show / Hide ---------- */
  function showAuthModal(tab) {
    injectAuthModal();
    const overlay = document.getElementById('auth-overlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hideError();

    // Switch to requested tab
    if (tab === 'signup') {
      document.getElementById('tab-signup').click();
    } else {
      document.getElementById('tab-login').click();
    }

    setTimeout(() => {
      const firstInput = overlay.querySelector('.auth-form:not([style*="display: none"]) .auth-input');
      if (firstInput) firstInput.focus();
    }, 300);
  }

  function hideAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /* ---------- Error Messages ---------- */
  function showError(msg) {
    const el = document.getElementById('auth-error');
    if (el) {
      el.textContent = msg;
      el.style.display = '';
    }
  }

  function hideError() {
    const el = document.getElementById('auth-error');
    if (el) el.style.display = 'none';
  }

  function friendlyError(code) {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return map[code] || `Error: ${code}. Please try again or check console.`;
  }

  /* ---------- Auth State → Header UI ---------- */
  function updateHeaderUI(user) {
    // Update all auth button containers on the page
    document.querySelectorAll('.header-auth').forEach(container => {
      if (user) {
        const initials = (user.displayName || user.email[0]).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const isAdmin = user.email === 'whitcroftholdings@gmail.com';
        const adminLink = isAdmin ? `
              <a href="admin.html" class="user-dropdown-item" id="admin-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </a>` : '';

        container.innerHTML = `
          <a href="create-post.html" class="write-btn" id="write-btn" title="Write a post">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Write
          </a>
          <div class="user-menu" id="user-menu">
            <button class="user-avatar-btn" id="user-avatar-btn" title="${user.displayName || user.email}">
              ${initials}
            </button>
            <div class="user-dropdown" id="user-dropdown">
              <div class="user-dropdown-header">
                <strong>${user.displayName || 'User'}</strong>
                <span>${user.email}</span>
              </div>
              <div class="user-dropdown-divider"></div>
              ${adminLink}
              <button class="user-dropdown-item" id="logout-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        `;

        // Avatar dropdown toggle
        const avatarBtn = container.querySelector('.user-avatar-btn');
        const dropdown = container.querySelector('.user-dropdown');
        if (avatarBtn && dropdown) {
          avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
          });
          document.addEventListener('click', () => dropdown.classList.remove('open'));
        }

        // Logout
        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            await fbAuth.signOut();
          });
        }
      } else {
        container.innerHTML = `
          <button class="auth-btn auth-btn-login" id="header-login">Log In</button>
          <button class="auth-btn auth-btn-signup" id="header-signup">Sign Up</button>
        `;

        container.querySelector('#header-login').addEventListener('click', () => showAuthModal('login'));
        container.querySelector('#header-signup').addEventListener('click', () => showAuthModal('signup'));
      }
    });

    // Update mobile nav auth section
    document.querySelectorAll('.mobile-nav-auth').forEach(container => {
      if (user) {
        container.innerHTML = `
          <a href="create-post.html" class="mobile-nav-write">Write a Post</a>
          <button class="mobile-nav-logout" id="mobile-logout">Log Out</button>
        `;
        const btn = container.querySelector('#mobile-logout');
        if (btn) btn.addEventListener('click', () => fbAuth.signOut());
      } else {
        container.innerHTML = `
          <button class="mobile-nav-auth-btn" id="mobile-login">Log In</button>
          <button class="mobile-nav-auth-btn mobile-nav-signup" id="mobile-signup">Sign Up</button>
        `;
        container.querySelector('#mobile-login').addEventListener('click', () => showAuthModal('login'));
        container.querySelector('#mobile-signup').addEventListener('click', () => showAuthModal('signup'));
      }
    });
  }

  /* ---------- Initialize ---------- */
  function init() {
    injectAuthModal();
    fbAuth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await user.getIdToken(true);
        } catch (err) {
          console.warn("Stale local session detected (possibly deleted from console). Logging out...", err);
          try {
            await fbAuth.signOut();
          } catch (signOutErr) {
            console.error("Error signing out:", signOutErr);
          }
          return;
        }
      }
      updateHeaderUI(user);
    });
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------- Public API ---------- */
  window.ElevateAuth = {
    showLoginModal: () => showAuthModal('login'),
    showSignupModal: () => showAuthModal('signup'),
    logout: () => fbAuth.signOut(),
    getCurrentUser: () => fbAuth.currentUser,
    onAuthStateChanged: (cb) => fbAuth.onAuthStateChanged(cb),
    getUserProfile: async () => {
      const user = fbAuth.currentUser;
      if (!user) return null;
      try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) return doc.data();
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
      return null;
    }
  };

})();
