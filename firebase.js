import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMWuBDM5rP3saLRJox-_LTqmM74EbkEtE",
    authDomain: "habittracker-firebase.firebaseapp.com",
    projectId: "habittracker-firebase",
    storageBucket: "habittracker-firebase.firebasestorage.app",
    messagingSenderId: "954081401064",
    appId: "1:954081401064:web:398f2053a7bddae373915d",
    measurementId: "G-90RYCRB3BT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

window.registerUser = function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            alert("User registered successfully");

            window.location.href = "login.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
}

window.loginUser = function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            alert("User logged in successfully");
            window.location.href = "index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
}

window.logoutUser = function () {
    signOut(auth).then(() => {
        // Sign-out successful.
        alert("User logged out successfully");
        console.log("User logged out successfully");
        // window.location.href = "login.html";
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
}

window.checkUserLoggedIn = function () {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            // console.log(uid);
            console.log("User is logged in", uid);
            
        } else {
            console.log("User is logged out");
            
            window.location.href = 'login.html';
        }
    });
}
