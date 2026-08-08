import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


console.log("Auth guard loaded");


onAuthStateChanged(auth, (user)=>{

    console.log("Current user:", user);


    if(!user){

        console.log("No user found. Redirecting...");

        window.location.href = "login.html";

    }

});