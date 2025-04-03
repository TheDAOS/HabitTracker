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
    addDoc,
    getDocs
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
            // console.log("User is logged in", uid);

        } else {
            // console.log("User is logged out");

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
    navigation.hideAll();
    checkUserLoggedIn();
    navigation.showDashboard();
    viewHabits();
    showDashboard();
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

window.viewHabits = async function () {
    const userRef = collection(db, "habits");
    const querySnapshot = await getDocs(userRef);


    querySnapshot.forEach((doc) => {
        const user = auth.currentUser.uid;
        const habit = doc.data();
        const habitsContainer = document.getElementById('habits-list');


        // console.log(habit.userId, user);

        if (habit.userId === user) {
            const habitCard = document.createElement('div');
            habitCard.className = "Habits";
            habitCard.onclick = function () {
                if (habitDetails.style.display === "none") {
                    habitDetails.style.display = "block";
                } else {
                    habitDetails.style.display = "none";
                }
            }

            const compactDIV = document.createElement('div');
            compactDIV.style.display = "flex";
            compactDIV.style.justifyContent = "space-between";
            compactDIV.style.alignItems = "center";
            compactDIV.style.gap = "10px";

            const div1 = document.createElement('div');
            div1.style.display = "flex";
            div1.style.alignItems = "center";
            div1.style.gap = "10px";

            const img = document.createElement('img');
            img.src = `https://api.dicebear.com/9.x/icons/svg?seed=${habit.name}&radius=50`;
            img.style.width = "34px";
            img.style.height = "34px";
            img.alt = "avatar";
            div1.appendChild(img);

            const name = document.createElement('h3');
            name.innerText = habit.name;
            div1.appendChild(name);

            compactDIV.appendChild(div1);

            const completedButton = document.createElement('button');
            completedButton.innerText = "Log";
            completedButton.onclick = function (event) {
                // Mark habit as completed logic
                console.log("Mark habit as completed", doc.id);
                event.stopPropagation();
            }
            compactDIV.appendChild(completedButton);

            habitCard.appendChild(compactDIV);

            const habitDetails = document.createElement('div');
            habitDetails.style.display = "none";

            const description = document.createElement('p');
            description.innerText = habit.description;
            habitDetails.appendChild(description);

            const category = document.createElement('p');
            category.innerText = `Category: ${habit.category}`;
            habitDetails.appendChild(category);

            const type = document.createElement('p');
            type.innerText = `Type: ${habit.type}`;
            habitDetails.appendChild(type);

            const difficulty = document.createElement('p');
            difficulty.innerText = `Difficulty: ${habit.difficulty}`;
            habitDetails.appendChild(difficulty);

            const goal = document.createElement('p');
            goal.innerText = `Goal: ${habit.goal}`;
            habitDetails.appendChild(goal);

            const streak = document.createElement('p');
            streak.innerText = `Streak: ${habit.streak}`;
            habitDetails.appendChild(streak);

            const totalCompleted = document.createElement('p');
            totalCompleted.innerText = `Total Completed: ${habit.totalCompleted}`;
            habitDetails.appendChild(totalCompleted);

            const reminder = document.createElement('p');
            reminder.innerText = `Reminder: ${habit.reminder ? "Yes" : "No"}`;
            habitDetails.appendChild(reminder);

            const editButton = document.createElement('button');
            editButton.innerText = "Edit";
            editButton.style.marginRight = "10px";
            editButton.onclick = function (event) {
                // Edit habit logic
                console.log("Edit habit", doc.id);
                event.stopPropagation();
            }
            habitDetails.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerText = "Delete";
            deleteButton.onclick = function (event) {
                // Delete habit logic
                console.log("Delete habit", doc.id);
                event.stopPropagation();
            }
            habitDetails.appendChild(deleteButton);

            habitCard.appendChild(habitDetails);

            habitsContainer.appendChild(habitCard);
        }

    });

    // navigation.showViewHabits();
}

window.showDashboard = async function () {
    // const progressBars = document.getElementById("progress-bars");

    // // Example data
    // const habits = [
    //     { name: "Exercise", progress: 70 },
    //     { name: "Reading", progress: 50 },
    //     { name: "Meditation", progress: 30 },
    // ];

    // // Populate progress bars
    // habits.forEach(habit => {
    //     const progressItem = document.createElement("div");
    //     progressItem.classList.add("progress-item");

    //     const label = document.createElement("label");
    //     label.textContent = habit.name;

    //     const progress = document.createElement("progress");
    //     progress.value = habit.progress;
    //     progress.max = 100;

    //     progressItem.appendChild(label);
    //     progressItem.appendChild(progress);
    //     progressBars.appendChild(progressItem);
    // });

    const categoryDashboard = document.getElementById("category-dashboard");
    const userRef = collection(db, "habits");
    const querySnapshot = await getDocs(userRef);

    const categories = {
        "health": { completed: 0, total: 0 },
        "productivity": { completed: 0, total: 0 },
        "lifestyle": { completed: 0, total: 0 },
        "learning": { completed: 0, total: 0 },
        "social": { completed: 0, total: 0 },
        "Other": { completed: 0, total: 0 },
    };

    querySnapshot.forEach((doc) => {
        const user = auth.currentUser.uid;
        const habit = doc.data();

        if (habit.userId === user) {
            // console.log(habit, habit.category);

            categories[habit.category].completed += habit.totalCompleted;
            categories[habit.category].total += getDaysFromCreated(habit.createdAt);
            // console.log(getDaysFromCreated(habit.createdAt), habit.category);
        }
    })

    const progressItem = document.createElement("div");
    progressItem.classList.add("progress-item");

    for (const key in categories) {


        const progressElement = document.createElement("div");
        progressElement.classList.add("dashboard-card-1");

        const label = document.createElement("label");
        label.textContent = key;

        const progressBar = document.createElement("div");
        const progress = document.createElement("div");

        if (categories[key].total !== 0) {
            const percent = (categories[key].completed / categories[key].total) * 100;
            progress.style.width = `${percent}%`;
        } else {
            progress.style.width = `0%`;
        }



        progressBar.appendChild(progress);

        progressElement.appendChild(label);
        progressElement.appendChild(progressBar);

        progressItem.appendChild(progressElement);
        categoryDashboard.appendChild(progressItem);
    }

    // console.log(categories);
}

function getDaysFromCreated(createdAt) {
    let createdDate;

    // Check if createdAt is a Firestore Timestamp object (has a toDate method)
    if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
        createdDate = createdAt.toDate();
    }
    // Else if it's already a Date object, use it directly
    else if (createdAt instanceof Date) {
        createdDate = createdAt;
    }
    // Otherwise, try to create a Date object from the input (works for ISO string or timestamp)
    else {
        createdDate = new Date(createdAt);
    }

    // Check if conversion was successful
    if (isNaN(createdDate.getTime())) {
        console.error('Invalid date:', createdAt);
        return NaN;
    }

    const today = new Date();

    // Calculate the difference in milliseconds
    const diffTime = today.getTime() - createdDate.getTime();

    // Convert milliseconds to days (milliseconds per day = 1000 * 60 * 60 * 24)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
}
