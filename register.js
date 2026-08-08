// ================================
// SAHA ENTERPRISE - REGISTER
// ================================


import {
    registerUser
} from "./auth/auth.js";




// ================================
// ELEMENTS
// ================================


const nameInput = document.getElementById("name");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const confirmPasswordInput =
document.getElementById("confirmPassword");


const registerBtn =
document.getElementById("registerBtn");


const errorMessage =
document.getElementById("errorMessage");





// ================================
// REGISTER USER
// ================================


registerBtn.addEventListener("click", async()=>{


    const name =
    nameInput.value.trim();


    const email =
    emailInput.value.trim();

    console.log("Registering email:", email);


    const password =
    passwordInput.value.trim();


    const confirmPassword =
    confirmPasswordInput.value.trim();





    if(
        name === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ){

        errorMessage.innerText =
        "Please fill all fields";

        return;

    }





    if(password !== confirmPassword){

        errorMessage.innerText =
        "Passwords do not match";

        return;

    }





    if(password.length < 6){

        errorMessage.innerText =
        "Password must be at least 6 characters";

        return;

    }





    try{


       await registerUser(
        name,
        email,
        password
    );

    errorMessage.style.color = "green";
    errorMessage.innerText = "Account created successfully! Redirecting...";

    setTimeout(() => {

    window.location.href = "login.html";

    }, 1000);



    }
   catch(error){

    console.error("Firebase Error Code:", error.code);
    console.error("Firebase Error Message:", error.message);

    errorMessage.style.color = "red";

    switch(error.code){

        case "auth/email-already-in-use":
            errorMessage.innerText = "Account is already registered.";
            break;

        case "auth/invalid-email":
            errorMessage.innerText = "Please enter a valid email address.";
            break;

        case "auth/weak-password":
            errorMessage.innerText = "Password must be at least 6 characters.";
            break;

        case "permission-denied":
        case "firestore/permission-denied":
            errorMessage.innerText = "Database permission denied.";
            break;

        default:
            errorMessage.innerText = "Something went wrong. Please try again.";
    }

}


});