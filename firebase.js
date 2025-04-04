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
    createChallenges: document.getElementById('createChallenge'),
    addHabit: document.getElementById('addHabit'),
    profile: document.getElementById('profile'),
    notifications: document.getElementById('notifications'),
    hideAll: function () {
        this.dashboard.style.display = "none";
        this.viewHabits.style.display = "none";
        this.community.style.display = "none";
        this.challenges.style.display = "none";
        this.createChallenges.style.display = "none";
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
    showCreateChallenges: function () {
        this.hideAll();
        this.createChallenges.style.display = "";
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
    showChallenges();
    // showCommunity();
    // showProfile();
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
            CreateChallengesButton.innerText = "Create Challenges from this";
            CreateChallengesButton.style.marginRight = "10px";
            CreateChallengesButton.onclick = function (event) {
                createChallengesFromHabit(doc.id, habit);
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
        label.style.fontWeight = "bold";

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

window.createChallengesFromHabit = async function (habitID, habitData) {
    const challengesRef = collection(db, "challenges");
    const user = auth.currentUser.uid;

    addDoc(challengesRef, {
        createdBy: user,
        participants: [user],
        name: habitData.name + " Challenge",
        template: habitData,
        createdAt: new Date(),
        endAt: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
    })
        .then(() => {
            alert("Challenge created successfully");
            refreshData();
            navigation.showChallenges();
        })
        .catch((error) => {
            console.error("Error adding challenge: ", error);
            alert("Error adding challenge");
        });
}

window.createChallenge = async function (event) {
    event.preventDefault();

    const challengeId = document.getElementById('challengeID').value;
    const challengeName = document.getElementById('challenge-name').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // habit template
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

    const userRef = collection(db, "challenges");
    const user = auth.currentUser.uid;
    try {

        await addDoc(userRef, {
            createdBy: user,
            participants: [user],
            name: challengeName,
            template: {
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
            },
            createdAt: new Date(startDate),
            endAt: new Date(endDate),
        })

        alert("Challenge created successfully");
        refreshData();
        navigation.showChallenges();

    } catch (error) {
        console.error("Error adding challenge: ", error);
        alert("Error adding challenge");
    }
}

window.showChallenges = async function () {
    const challengesList = document.getElementById('challenges-list');
    challengesList.innerHTML = ``;
    const challengesRef = collection(db, "challenges");
    const querySnapshot = await getDocs(challengesRef);
    const user = auth.currentUser.uid;

    querySnapshot.forEach((doc) => {
        const challenge = doc.data();
        const challengeCard = document.createElement('div');
        challengeCard.className = "Habits";
        challengeCard.onclick = function () {
            if (challengeDetails.style.display === "none") {
                challengeDetails.style.display = "block";
            } else {
                challengeDetails.style.display = "none";
            }
        }
        const compactDIV = document.createElement('div');
        compactDIV.className = "compactDIV";
        compactDIV.style.display = "flex";
        compactDIV.style.flexDirection = "row";
        compactDIV.style.justifyContent = "space-between";
        compactDIV.style.alignItems = "center";
        compactDIV.style.gap = "10px";

        const div1 = document.createElement('div');
        div1.className = 'compactDIV';

        const name = document.createElement('h3');
        name.innerText = challenge.name;
        div1.appendChild(name);

        const participants = document.createElement('p');
        participants.innerText = `Participants: ${challenge.participants.length}`;
        div1.appendChild(participants);

        const createdAt = document.createElement('p');
        createdAt.innerText = `Created At: ${challenge.createdAt.toDate().toLocaleDateString()}`;
        div1.appendChild(createdAt);

        const endAt = document.createElement('p');
        endAt.innerText = `Ends At: ${challenge.endAt.toDate().toLocaleDateString()}`;
        div1.appendChild(endAt);

        compactDIV.appendChild(div1);

        const div2 = document.createElement('div');

        const joinButton = document.createElement('button');
        joinButton.innerText = "Join";
        joinButton.style.marginRight = "10px";
        joinButton.onclick = function (event) {
            // Join challenge logic
            // console.log("Join challenge", doc.id);
            joinChallenge(doc.id, challenge);
            event.stopPropagation();
        }
        div2.appendChild(joinButton);

        compactDIV.appendChild(div2);

        challengeCard.appendChild(compactDIV);



        const challengeDetails = document.createElement('div');
        challengeDetails.style.display = "none";

        const message = document.createElement('p');
        message.innerText = "Challenge Details";
        message.style.fontSize = "20px";
        message.style.fontWeight = "bold";
        challengeDetails.appendChild(message);

        const description = document.createElement('p');
        description.innerText = challenge.template.description;
        challengeDetails.appendChild(description);

        const category = document.createElement('p');
        category.innerText = `Category: ${challenge.template.category}`;
        challengeDetails.appendChild(category);

        const type = document.createElement('p');
        type.innerText = `Type: ${challenge.template.type}`;
        challengeDetails.appendChild(type);

        const difficulty = document.createElement('p');
        difficulty.innerText = `Difficulty: ${challenge.template.difficulty}`;
        challengeDetails.appendChild(difficulty);

        const goal = document.createElement('p');
        goal.innerText = `Goal: ${challenge.template.goal}`;
        challengeDetails.appendChild(goal);

        const reminder = document.createElement('p');
        reminder.innerText = `Reminder: ${challenge.template.reminder ? "Yes" : "No"}`;
        challengeDetails.appendChild(reminder);

        if (challenge.createdBy === user) {
            const challengeModifications = document.createElement('div');
            challengeModifications.style.display = "flex";
            challengeModifications.style.gap = "10px";

            const editButton = document.createElement('button');
            editButton.innerText = "Edit";
            editButton.style.marginRight = "5px";
            editButton.onclick = function (event) {
                // Edit challenge logic
                // console.log("Edit challenge", doc.id);
                editChallenge(doc.id, challenge);
                event.stopPropagation();
            }
            challengeModifications.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerText = "Delete";
            deleteButton.onclick = function (event) {
                // Delete challenge logic
                // console.log("Delete challenge", doc.id);
                deleteChallenge(doc.id)
                event.stopPropagation();
            }

            challengeModifications.appendChild(deleteButton);


            challengeDetails.appendChild(challengeModifications);
        }

        challengeCard.appendChild(challengeDetails);

        challengesList.appendChild(challengeCard);
    });
    // navigation.showChallenges();
}

async function joinChallenge(challengeId, challengeData) {
    const challengesRef = collection(db, "challenges");
    const challengeRef = doc(challengesRef, challengeId);

    let user = auth.currentUser.uid;

    if (challengeData.participants.indexOf(user) !== -1) {
        alert("You are already a participant in this challenge");
        return;
    }

    let participants = challengeData.participants;
    participants.push(user);

    try {

        // Add the habit to the user's habits collection
        const habitRef = collection(db, "habits");

        await addDoc(habitRef, {
            userId: user,
            name: challengeData.template.name,
            description: challengeData.template.description,
            category: challengeData.template.category,
            type: challengeData.template.type,
            difficulty: challengeData.template.difficulty,
            createdAt: new Date(),
            lastUpdated: new Date(),
            streak: 0,
            totalCompleted: 0,
            goal: challengeData.template.goal * 1,
            log: 0,
            history: [],
            reminder: (challengeData.template.reminder) ? {
                frequency: challengeData.template.reminder.frequency,
                days: challengeData.template.reminder.days,
            } : false,
        })


        // Update the challenge document with the new participant
        await updateDoc(challengeRef, {
            participants: participants,
            lastUpdated: new Date()
        })

        alert("Challenge joined successfully");
        refreshData();

    } catch (error) {
        console.error("Error joining challenge: ", error);
    }
}

async function editChallenge(challengeId, challengeData) {
    document.getElementById('challengeID').value = challengeId;
    document.getElementById('challenge-name').value = challengeData.name;

    document.getElementById('challenge-start-date').value = challengeData.createdAt.toDate().toISOString().split("T")[0];
    document.getElementById('challenge-end-date').value = challengeData.endAt.toDate().toISOString().split("T")[0];

    document.getElementById('challenge-habit-name').value = challengeData.template.name;
    document.getElementById('challenge-habit-description').value = challengeData.template.description;
    document.getElementById('challenge-habit-category').value = challengeData.template.category;
    document.getElementById('challenge-type').value = challengeData.template.type;
    document.getElementById('challenge-difficulty').value = challengeData.template.difficulty;
    document.getElementById('challenge-goal').value = challengeData.template.goal;
    if (challengeData.template.reminder === false) {
        document.getElementById('challenge-reminders').checked = false;
    } else {
        document.getElementById('challenge-reminders').checked = true;
        document.getElementById('challenge-reminder-time').value = challengeData.template.reminder.frequency;
        const checkboxes = document.querySelectorAll('.template-days');

        checkboxes.forEach((checkbox, i) => {
            if (challengeData.template.reminder.days.indexOf(i) !== -1) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
    }
    navigation.showCreateChallenges();
}

async function deleteChallenge(challengeId) {
    const challengesRef = collection(db, "challenges");
    const challengeRef = doc(challengesRef, challengeId);

    deleteDoc(challengeRef)
        .then(() => {
            // console.log("Challenge deleted successfully");
            refreshData();
        })
        .catch((error) => {
            console.error("Error deleting challenge: ", error);
        });
}