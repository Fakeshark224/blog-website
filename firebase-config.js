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
  apiKey: "AIzaSyADpHyd5tlDTEQ1JaeS7IfxnEpN81BCvWk",
  authDomain: "elevate-blog-260d7.firebaseapp.com",
  projectId: "elevate-blog-260d7",
  storageBucket: "elevate-blog-260d7.firebasestorage.app",
  messagingSenderId: "716369645275",
  appId: "1:716369645275:web:478824cb76f3034a2786fe"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references used by auth.js, posts.js, and script.js
const db     = firebase.firestore();
const fbAuth = firebase.auth();
