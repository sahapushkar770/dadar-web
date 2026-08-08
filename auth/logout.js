// ================================
// SAHA ENTERPRISE - LOGOUT
// ================================

import { auth } from "./firebase-config.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    try {

        await signOut(auth);

        window.location.href = "../login.html";

    } catch (error) {

        console.error(error);

        alert("Unable to logout.");

    }

});