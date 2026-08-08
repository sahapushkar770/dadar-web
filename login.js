// ================================
// SAHA ENTERPRISE - LOGIN EMAIL PASSWORD
// ================================


import { auth } from "./auth/firebase-config.js";


import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";



// ================================
// ELEMENTS
// ================================


const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

const forgotPasswordLink =
document.getElementById("forgotPasswordLink");

const errorMessage = document.getElementById("errorMessage");




// ================================
// LOGIN USER
// ================================


loginBtn.addEventListener("click", async()=>{


    const email = emailInput.value.trim();

    const password = passwordInput.value.trim();



    if(email === "" || password === ""){

        errorMessage.innerText =
        "Please enter email and password";

        return;

    }



    try{


        const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        const user = userCredential.user;



        console.log(
            "Login successful:",
            user.email
        );



        // Redirect after login

        window.location.href = "home.html";



    }
    catch(error){


        console.error(error);



        if(error.code === "auth/invalid-credential"){

            errorMessage.innerText =
            "Invalid email or password";

        }

        else if(error.code === "auth/user-not-found"){

            errorMessage.innerText =
            "Account not found";

        }

        else if(error.code === "auth/wrong-password"){

            errorMessage.innerText =
            "Wrong password";

        }

        else{

            errorMessage.innerText =
            error.message;

        }


    }


});

// ================================
// FORGOT PASSWORD
// ================================

forgotPasswordLink.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();

    if(email === ""){

        errorMessage.style.color = "red";
        errorMessage.innerText =
        "Please enter your email first.";

        return;

    }

    try{

        await sendPasswordResetEmail(auth, email);

        errorMessage.style.color = "green";
        errorMessage.innerText =
        "Password reset email sent. Please check your inbox.";

    }
    catch(error){

        errorMessage.style.color = "red";

        switch(error.code){

            case "auth/user-not-found":
            case "auth/invalid-credential":
                errorMessage.innerText =
                "No account found with this email.";
                break;

            case "auth/invalid-email":
                errorMessage.innerText =
                "Please enter a valid email address.";
                break;

            default:
                errorMessage.innerText =
                "Unable to send reset email. Please try again.";
        }

    }

});