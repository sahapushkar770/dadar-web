import { 
    auth, 
    db 
} from "./firebase-config.js";

import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// REGISTER USER

// REGISTER USER

export async function registerUser(name, email, password) {

    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = userCredential.user;

    try {

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            createdAt: new Date()
        });

        return user;

    } catch (error) {

        console.error("Firestore Error:", error);

        throw error;
    }
}



// LOGIN USER

export async function loginUser(email, password){

    try{

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return userCredential.user;


    }catch(error){

        throw error;

    }

}