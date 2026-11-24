import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1gTKAMEqm2vbqmPKtUIYo-RrbQNPpvpo",
    authDomain: "sahaenterpriceweb.firebaseapp.com",
    projectId: "sahaenterpriceweb",
    storageBucket: "sahaenterpriceweb.firebasestorage.app",
    messagingSenderId: "934117245030",
    appId: "1:934117245030:web:1d9137468ac54ba6abeda7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// Local persistent cache: saves are kept safely even if the page changes
// or the internet drops, and are sent to the server when possible.
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

export { auth, db };