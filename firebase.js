import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const db = getFirestore(app);

window.registerUser = async function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user;

        // Add user data to Firestore
        const userRef = collection(db, "users");
        await addDoc(userRef, {
            username: username,
            email: email,
            uid: user.uid,
            habits: [],
        });
        // console.log("User data added to Firestore");
        alert("User registered successfully");
        window.location.href = "login.html";
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
    }
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
        // alert("User logged out successfully");
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

window.navigation = {
    dashboard: document.getElementById('dashboard'),
    viewHabits: document.getElementById('viewHabits'),
    community: document.getElementById('community'),
    challenges: document.getElementById('challenges'),
    addHabit: document.getElementById('addHabit'),
    profile: document.getElementById('profile'),
    notifications: document.getElementById('notifications'),
    hideAll: function () {
        this.dashboard.style.display = "none";
        this.viewHabits.style.display = "none";
        this.community.style.display = "none";
        this.challenges.style.display = "none";
        this.addHabit.style.display = "none";
        this.profile.style.display = "none";
        this.notifications.style.display = "none";
    },
    showDashboard: function () {
        this.hideAll();
        this.dashboard.style.display = "";
    },
    showViewHabits: function () {
        this.hideAll();
        this.viewHabits.style.display = "";
    },
    showCommunity: function () {
        this.hideAll();
        this.community.style.display = "";
    },
    showChallenges: function () {
        this.hideAll();
        this.challenges.style.display = "";
    },
    showAddHabit: function () {
        this.hideAll();
        this.addHabit.style.display = "";
    },
    showProfile: function () {
        this.hideAll();
        this.profile.style.display = "";
    },
    showNotifications: function () {
        this.hideAll();
        this.notifications.style.display = "";
    }
}

window.indexLoad = function () {
    checkUserLoggedIn()
    navigation.showDashboard()
}

window.addHabit = function (event) {
    event.preventDefault();
    const habitName = document.getElementById('habit-name').value;
    const habitDescription = document.getElementById('habit-description').value;
    const habitCategory = document.getElementById('habit-category').value;
    const habitType = document.getElementById('type').value;
    const habitDifficulty = document.getElementById('difficulty').value;
    const habitGoal = document.getElementById('goal').value;
    const habitReminder = document.getElementById('reminders').checked;
    const habitReminderTime = document.getElementById('reminder-time').value;
    const checkboxes = document.querySelectorAll('.day');

    const checkedDays = [];
    const weekdays = [
        "Sunday", "Monday",
        "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedDays.push(weekdays.indexOf(checkbox.value));
        }
    });

    // Add habit to Firestore
    const userRef = collection(db, "habits");
    addDoc(userRef, {
        userId: auth.currentUser.uid,
        name: habitName,
        description: habitDescription,
        category: habitCategory,
        type: habitType,
        difficulty: habitDifficulty,
        createdAt: new Date(),
        lastUpdated: new Date(),
        streak: 0,
        totalCompleted: 0,
        goal: habitGoal,
        reminder: (habitReminder) ? {
            frequency: habitReminderTime,
            days: checkedDays,
        } : false,
    })
        .then(() => {
            alert("Habit added successfully");
            // window.location.href = "index.html";
            navigation.showViewHabits();
        })
        .catch((error) => {
            console.error("Error adding habit: ", error);
            alert("Error adding habit");
        });
}