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
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
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
    refreshData();
}

function refreshData() {
    viewHabits();
    showDashboard();
}

window.addHabit = function (event) {
    event.preventDefault();
    const habitID = document.getElementById('habitID').value;
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

    const userRef = collection(db, "habits");

    if (habitID === "") {
        // Add habit to Firestore
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
            goal: habitGoal * 1,
            log: 0,
            history: [],
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
    } else {
        // Update habit in Firestore
        const habitRef = doc(userRef, habitID);

        updateDoc(habitRef, {
            name: habitName,
            description: habitDescription,
            category: habitCategory,
            type: habitType,
            difficulty: habitDifficulty,
            goal: habitGoal * 1,
            reminder: (habitReminder) ? {
                frequency: habitReminderTime,
                days: checkedDays,
            } : false,
        })
            .then(() => {
                alert("Habit updated successfully");
                navigation.showViewHabits();
            })
            .catch((error) => {
                console.error("Error updating habit: ", error);
                alert("Error updating habit");
            });
    }
}

window.viewHabits = async function () {
    const userRef = collection(db, "habits");
    const querySnapshot = await getDocs(userRef);
    const user = auth.currentUser.uid;
    const habitsContainer = document.getElementById('habits-list');
    habitsContainer.innerHTML = ``;


    querySnapshot.forEach((doc) => {
        const habit = doc.data();

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
            completedButton.innerText = "Log Progress";
            completedButton.onclick = function (event) {
                logHabit(doc.id, habit);
                // console.log("Mark habit as completed", doc.id);
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

            const log = document.createElement('p');
            log.innerText = `Log: ${habit.log}`;
            habitDetails.appendChild(log);

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

            const CreateChallengesButton = document.createElement('button');
            CreateChallengesButton.innerText = "Create from this Challenges";
            CreateChallengesButton.style.marginRight = "10px";
            CreateChallengesButton.onclick = function (event) {
                CreateChallenges(doc.id, habit);
                event.stopPropagation();
            }
            habitDetails.appendChild(CreateChallengesButton);

            const editButton = document.createElement('button');
            editButton.innerText = "Edit";
            editButton.style.marginRight = "10px";
            editButton.onclick = function (event) {
                // Edit habit logic
                // console.log("Edit habit", doc.id);
                editHabit(doc.id, habit);
                event.stopPropagation();
            }
            habitDetails.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerText = "Delete";
            deleteButton.onclick = function (event) {
                // Delete habit logic
                // console.log("Delete habit", doc.id);
                deleteHabit(doc.id)
                event.stopPropagation();
            }
            habitDetails.appendChild(deleteButton);

            habitCard.appendChild(habitDetails);

            habitsContainer.appendChild(habitCard);
        }

    });

    // navigation.showViewHabits();
}

async function logHabit(habitId, habitData) {
    const userRef = collection(db, "habits");
    const habitRef = doc(userRef, habitId);

    let isToday = true;
    if (habitData.history.length > 0) {
        isToday = areDatesOnSameDayOfWeek(habitData.history[habitData.history.length - 1])
    }

    let log = habitData.log;
    if (isToday) {
        log++;
    } else {
        log = 1;
    }
    let streak = habitData.streak;
    let totalCompleted = habitData.totalCompleted;
    let history = habitData.history;
    history.push(new Date());

    if (log >= habitData.goal) {
        streak += 1
        totalCompleted++;
        log = 0;
    }


    // console.log(
    //     log,
    //     history,
    //     streak,
    //     totalCompleted,
    //     areDatesOnSameDayOfWeek(history[history.length - 1]),
    //     history[history.length - 1],
    // )

    updateDoc(habitRef, {
        totalCompleted: totalCompleted,
        streak: streak,
        log: log,
        history: history,
        lastUpdated: new Date()
    })
        .then(() => {
            // console.log("Habit logged successfully");
            refreshData();
        })
        .catch((error) => {
            console.error("Error logging habit: ", error);
        });
}

async function editHabit(habitId, habitData) {
    document.getElementById('habitID').value = habitId;
    document.getElementById('habit-name').value = habitData.name;
    document.getElementById('habit-description').value = habitData.description;
    document.getElementById('habit-category').value = habitData.category;
    document.getElementById('type').value = habitData.type;
    document.getElementById('difficulty').value = habitData.difficulty;
    document.getElementById('goal').value = habitData.goal;

    if (habitData.reminder === false) {
        document.getElementById('reminders').checked = false;
    } else {
        document.getElementById('reminders').checked = true;
        document.getElementById('reminder-time').value = habitData.reminder.frequency;
        const checkboxes = document.querySelectorAll('.day');

        const weekdays = [
            "Sunday", "Monday",
            "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        checkboxes.forEach((checkbox, i) => {
            if (habitData.reminder.days.indexOf(i) !== -1) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
    }
    navigation.showAddHabit();
}

function deleteHabit(habitId) {
    const userRef = collection(db, "habits");
    const habitRef = doc(userRef, habitId);

    deleteDoc(habitRef)
        .then(() => {
            // console.log("Habit deleted successfully");
            refreshData();
        })
        .catch((error) => {
            console.error("Error deleting habit: ", error);
        });

}

function areDatesOnSameDayOfWeek(date) {
    if (!date) return false;



    if (!(date instanceof Date)) {
        date = date.toDate();
    }

    const today = new Date();

    const givenDayOfWeek = date.getDay();
    const todayDayOfWeek = today.getDay();

    return givenDayOfWeek === todayDayOfWeek;
}

window.showDashboard = async function () {
    const categoryDashboard = document.getElementById("category-dashboard");
    categoryDashboard.innerHTML = ``;
    const userRef = collection(db, "habits");
    const querySnapshot = await getDocs(userRef);
    const user = auth.currentUser.uid;

    const categories = {
        "health": { completed: 0, total: 0 },
        "productivity": { completed: 0, total: 0 },
        "lifestyle": { completed: 0, total: 0 },
        "learning": { completed: 0, total: 0 },
        "social": { completed: 0, total: 0 },
        "Other": { completed: 0, total: 0 },
    };

    querySnapshot.forEach((doc) => {
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

    const streakDiv = document.createElement("div");
    streakDiv.classList.add("streakDashboard");



    querySnapshot.forEach((doc) => {

        const habit = doc.data();

        // console.log(habit.userId, user);

        if (habit.userId === user) {
            const streakCard = document.createElement("div");
            streakCard.classList.add("streakCard");

            const name = document.createElement("div");
            name.innerText = habit.name;
            streakCard.appendChild(name);


            const img = document.createElement('img');
            img.src = 'images/streak.png';
            img.alt = 'Streak';
            img.style.width = "84px";
            streakCard.appendChild(img);

            const streakNo = document.createElement("span");
            streakNo.style.fontSize = "72px";
            streakNo.innerText = habit.streak;

            streakCard.appendChild(streakNo);

            streakDiv.appendChild(streakCard);
        }
    })

    categoryDashboard.appendChild(streakDiv);


    const goalDiv = document.createElement("div");
    goalDiv.classList.add("streakDashboard");

    querySnapshot.forEach((doc) => {
        const habit = doc.data();

        if (habit.userId === user) {
            const goalCard = document.createElement("div");
            goalCard.classList.add("streakCard");

            const name = document.createElement("div");
            name.innerText = habit.name;
            goalCard.appendChild(name);

            const img = document.createElement('img');
            img.src = 'images/trophy.png';
            img.alt = 'Trophy';
            img.style.width = "84px";
            goalCard.appendChild(img);

            const logAndGoal = document.createElement("span");
            logAndGoal.style.fontSize = "72px";
            logAndGoal.innerText = habit.log + '/' + habit.goal;

            goalCard.appendChild(logAndGoal);

            goalDiv.appendChild(goalCard);
        }
    })

    categoryDashboard.appendChild(goalDiv);
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

window.CreateChallenges = async function (habitID, habitData) {
    const challengesRef = collection(db, "challenges");

    addDoc(challengesRef, {
        createdBy: auth.currentUser.uid,
        participants: [ habitID ],
        name: habitData.name + " Challenge",
        description: habitData.description,
        category: habitData.category,
        type: habitData.type,
        difficulty: habitData.difficulty,
        goal: habitData.goal * 1,
        template: habitData,
        createdAt: new Date(),
    })
        .then(() => {
            alert("Challenge created successfully");
            navigation.showChallenges();
        })
        .catch((error) => {
            console.error("Error adding challenge: ", error);
            alert("Error adding challenge");
        });
}