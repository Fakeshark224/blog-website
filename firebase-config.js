/* ==========================================================================
   ELEVATE — Firebase Configuration
   ==========================================================================

   SETUP INSTRUCTIONS:
   ───────────────────
   1. Go to https://console.firebase.google.com/
   2. Click "Add project" → name it → create
   3. Click the </> (Web) icon to add a web app
   4. Copy your firebaseConfig object and paste it below
   5. Enable Auth:  Authentication → Sign-in method → Email/Password → Enable
   6. Create DB:    Firestore Database → Create database → Start in test mode
   7. Paste these Firestore security rules in Firestore → Rules tab:

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /posts/{postId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null
                                && request.auth.uid == resource.data.authorId;
       }
       match /users/{userId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ========================================================================== */

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references used by auth.js, posts.js, and script.js
const db     = firebase.firestore();
const fbAuth = firebase.auth();
