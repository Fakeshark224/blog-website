/* ==========================================================================
   ELEVATE — Ad Engine & Sponsored Content
   Depends on: firebase-config.js (firebase, db, fbAuth)
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Constants ---------- */
  const ADMIN_EMAIL = 'whitcroftholdings@gmail.com';
  /* ========================================================================
     ADMIN UTILITIES
     ======================================================================== */

  /**
   * isAdmin — Returns true if the current Firebase Auth user
   * matches the designated admin email.
   */
  function isAdmin() {
    return !!(fbAuth.currentUser && fbAuth.currentUser.email === ADMIN_EMAIL);
  }

  /**
   * hashPassword — SHA-256 hash using the Web Crypto API.
   * Returns lowercase hex string.
   */
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data    = encoder.encode(password);
    const buffer  = await crypto.subtle.digest('SHA-256', data);
    const bytes   = Array.from(new Uint8Array(buffer));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * getAdminConfig — Fetch the admin_config/settings document.
   * Returns the document data or null if it doesn't exist.
   */
  async function getAdminConfig() {
    try {
      const doc = await db.collection('admin_config').doc('settings').get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.warn('[ElevateAds] getAdminConfig error:', err.message);
      return null;
    }
  }

  /**
   * setAdminPassword — Hash the password and persist it to
   * admin_config/settings (set with merge to preserve other fields).
   */
  async function setAdminPassword(password) {
    const hash = await hashPassword(password);
    await db.collection('admin_config').doc('settings').set({
      adminPasswordHash: hash
    }, { merge: true });
  }

  /**
   * verifyAdminPassword — Compare hashed input against stored hash.
   * Tracks failed attempts and enforces a 5-minute lockout after 3 failures.
   * Returns { success, locked, remainingMinutes }.
   */
  async function verifyAdminPassword(password) {
    const configRef = db.collection('admin_config').doc('settings');
    const config    = await getAdminConfig();

    if (!config || !config.adminPasswordHash) {
      return { success: false, locked: false, remainingMinutes: 0 };
    }

    // Check lockout
    if (config.lockoutUntil) {
      const lockoutTime = config.lockoutUntil.toDate ? config.lockoutUntil.toDate() : new Date(config.lockoutUntil);
      const now         = new Date();

      if (now < lockoutTime) {
        const remaining = Math.ceil((lockoutTime - now) / 60000);
        return { success: false, locked: true, remainingMinutes: remaining };
      }

      // Lockout expired — reset
      await configRef.update({ failedAttempts: 0, lockoutUntil: null });
    }

    // Compare hashes
    const inputHash = await hashPassword(password);

    if (inputHash === config.adminPasswordHash) {
      // Successful — reset failed attempts
      await configRef.update({ failedAttempts: 0, lockoutUntil: null });
      return { success: true, locked: false, remainingMinutes: 0 };
    }

    // Failed attempt
    const attempts = (config.failedAttempts || 0) + 1;
    const update   = { failedAttempts: attempts };

    if (attempts >= 3) {
      // Lockout for 5 minutes
      const lockoutUntil    = new Date(Date.now() + 5 * 60 * 1000);
      update.lockoutUntil   = firebase.firestore.Timestamp.fromDate(lockoutUntil);
    }

    await configRef.update(update);

    return {
      success:          false,
      locked:           attempts >= 3,
      remainingMinutes: attempts >= 3 ? 5 : 0
    };
  }

  /**
   * resetFailedAttempts — Clear the failed-attempts counter in admin_config.
   */
  async function resetFailedAttempts() {
    await db.collection('admin_config').doc('settings').update({
      failedAttempts: 0,
      lockoutUntil:   null
    });
  }

  /* ========================================================================
     AD CRUD (Admin)
     ======================================================================== */

  /**
   * createAd — Add a new ad document with server timestamp and zero clicks.
   */
  async function createAd(adData) {
    const doc = {
      ...adData,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
      clickCount: 0
    };

    const ref = await db.collection('ads').add(doc);
    return { id: ref.id, ...doc };
  }

  /**
   * updateAd — Update an existing ad document by ID.
   */
  async function updateAd(adId, adData) {
    await db.collection('ads').doc(adId).update(adData);
  }

  /**
   * deleteAd — Remove an ad document by ID.
   */
  async function deleteAd(adId) {
    await db.collection('ads').doc(adId).delete();
  }

  /**
   * getAllAds — Retrieve every ad, newest first.
   */
  async function getAllAds() {
    const snapshot = await db.collection('ads')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /* ========================================================================
     SPONSORED REQUESTS
     ======================================================================== */

  /**
   * createSponsorRequest — Submit a new sponsorship request
   * with 'pending' status and a server timestamp.
   */
  async function createSponsorRequest(data) {
    const doc = {
      postId:         data.postId         || '',
      postTitle:      data.postTitle      || '',
      requesterName:  data.requesterName  || '',
      requesterEmail: data.requesterEmail || '',
      duration:       data.duration       || '',
      message:        data.message        || '',
      status:         'pending',
      createdAt:      firebase.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db.collection('sponsored_requests').add(doc);
    return { id: ref.id, ...doc };
  }

  /**
   * getAllSponsorRequests — Retrieve all sponsorship requests, newest first.
   */
  async function getAllSponsorRequests() {
    const snapshot = await db.collection('sponsored_requests')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * updateSponsorRequestStatus — Update a request's status.
   * If approved, also mark the associated post as sponsored and
   * calculate the sponsoredUntil date based on the request's duration.
   */
  async function updateSponsorRequestStatus(requestId, status) {
    const reqRef = db.collection('sponsored_requests').doc(requestId);
    await reqRef.update({ status });

    // If approved, flag the post as sponsored
    if (status === 'approved') {
      const reqDoc = await reqRef.get();
      if (!reqDoc.exists) return;

      const reqData = reqDoc.data();
      if (!reqData.postId) return;

      // Calculate sponsoredUntil from duration string
      const sponsoredUntil = calculateSponsoredUntil(reqData.duration);

      await db.collection('posts').doc(reqData.postId).update({
        isSponsored:    true,
        sponsoredUntil: sponsoredUntil.toISOString()
      });
    }
  }

  /**
   * calculateSponsoredUntil — Parse a human-readable duration string
   * (e.g. "7 days", "2 weeks", "1 month") into a future Date.
   * Defaults to 7 days if the format is unrecognised.
   */
  function calculateSponsoredUntil(duration) {
    const now   = new Date();
    const lower = (duration || '').toLowerCase().trim();

    const match = lower.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);
    if (!match) {
      // Default: 7 days
      now.setDate(now.getDate() + 7);
      return now;
    }

    const value = parseInt(match[1], 10);
    const unit  = match[2];

    if (unit.startsWith('day')) {
      now.setDate(now.getDate() + value);
    } else if (unit.startsWith('week')) {
      now.setDate(now.getDate() + value * 7);
    } else if (unit.startsWith('month')) {
      now.setMonth(now.getMonth() + value);
    }

    return now;
  }

  /* ========================================================================
     PUBLIC API
     ======================================================================== */

  window.ElevateAds = {
    // Constants
    ADMIN_EMAIL,

    // Admin utilities
    isAdmin,
    hashPassword,
    getAdminConfig,
    setAdminPassword,
    verifyAdminPassword,
    resetFailedAttempts,

    // Ad CRUD
    createAd,
    updateAd,
    deleteAd,
    getAllAds,

    // Sponsored requests
    createSponsorRequest,
    getAllSponsorRequests,
    updateSponsorRequestStatus
  };

})();
