import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSZ2ycksOHdbPcV0vtbH-G-zk1Py_a9nk",
  authDomain: "maslog-978e6.firebaseapp.com",
  projectId: "maslog-978e6",
  storageBucket: "maslog-978e6.firebasestorage.app",
  messagingSenderId: "554404722437",
  appId: "1:554404722437:web:9fdc761ed43eb4856ee96c",
  measurementId: "G-NT5XMBTXZM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const evaluationPage = document.getElementById("evaluationPage");
const sideMenu = document.getElementById("sideMenu");
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const themeButtons = document.querySelectorAll(".theme-option");

const accountBtn = document.getElementById("accountBtn");
const accountModalOverlay = document.getElementById("accountModalOverlay");
const accountModalClose = document.getElementById("accountModalClose");
const accountEmail = document.getElementById("accountEmail");
const logoutBtn = document.getElementById("logoutBtn");

const authRequiredCard = document.getElementById("authRequiredCard");
const summaryRequiredCard = document.getElementById("summaryRequiredCard");
const checkinCard = document.getElementById("checkinCard");

const checkinList = document.getElementById("checkinList");
const saveCheckinBtn = document.getElementById("saveCheckinBtn");
const checkinStatus = document.getElementById("checkinStatus");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let currentUser = null;
let selectedCategories = [];
let selectedRatings = {};

const categoryMeta = {
  physiological: {
    title: "Physiological Well-Being",
    activity:
      "Choose one body-supporting action today: drink a full glass of water, eat one balanced meal, or go to bed 20 minutes earlier.",
  },
  safety: {
    title: "Safety & Stability",
    activity:
      "Do one grounding action today: make a short plan for tomorrow, clean one small space, or write down your top 3 priorities.",
  },
  social: {
    title: "Social Connection & Belonging",
    activity:
      "Take one connection step today: text someone, respond to a message, or spend 10 intentional minutes with someone you trust.",
  },
  esteem: {
    title: "Esteem & Confidence",
    activity:
      "Build self-trust with one small win today: finish one task, reflect on one success, or take one step toward a personal goal.",
  },
};

function openMenu() {
  sideMenu.classList.add("open");
  menuOverlay.classList.add("show");
}

function closeMenu() {
  sideMenu.classList.remove("open");
  menuOverlay.classList.remove("show");
}

function setTheme(themeName) {
  evaluationPage.classList.remove(...themeClasses);
  evaluationPage.classList.add(`theme-${themeName}`);

  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === themeName);
  });

  localStorage.setItem("maslogTheme", themeName);
}

function openAccountModal() {
  if (currentUser) {
    accountEmail.textContent = currentUser.email || "No email available";
  }
  accountModalOverlay.classList.add("show");
}

function closeAccountModal() {
  accountModalOverlay.classList.remove("show");
}

function showOnly(card) {
  [authRequiredCard, summaryRequiredCard, checkinCard].forEach((section) => {
    section.classList.add("hidden");
  });
  card.classList.remove("hidden");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiffFromISO(prevDateStr, newDateStr) {
  const prev = new Date(`${prevDateStr}T00:00:00`);
  const curr = new Date(`${newDateStr}T00:00:00`);
  const diffMs = curr - prev;
  return Math.round(diffMs / 86400000);
}

function renderCheckins(categories, existingDailyData = {}) {
  checkinList.innerHTML = "";
  selectedRatings = existingDailyData.ratings ? { ...existingDailyData.ratings } : {};

  categories.forEach((categoryKey) => {
    const wrapper = document.createElement("div");
    wrapper.className = "checkin-item";

    const streakCount =
      existingDailyData.streaks &&
      typeof existingDailyData.streaks[categoryKey]?.count === "number"
        ? existingDailyData.streaks[categoryKey].count
        : 0;

    wrapper.innerHTML = `
      <h2>${categoryMeta[categoryKey].title}</h2>

      <div class="activity-card">
        <p class="activity-label">Today's activity</p>
        <p class="activity-text">${categoryMeta[categoryKey].activity}</p>
      </div>

      <div class="streak-box">
        <strong>Current streak:</strong> ${streakCount} day${streakCount === 1 ? "" : "s"}
      </div>

      <div class="star-row" data-category="${categoryKey}">
        <button class="star-btn" type="button" data-value="1">★1</button>
        <button class="star-btn" type="button" data-value="2">★2</button>
        <button class="star-btn" type="button" data-value="3">★3</button>
        <button class="star-btn" type="button" data-value="4">★4</button>
        <button class="star-btn" type="button" data-value="5">★5</button>
      </div>
    `;

    checkinList.appendChild(wrapper);
  });

  bindStarButtons();
  restoreSelectedStars();
}

function bindStarButtons() {
  document.querySelectorAll(".star-row").forEach((row) => {
    const category = row.dataset.category;
    const buttons = row.querySelectorAll(".star-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("selected"));
        button.classList.add("selected");
        selectedRatings[category] = Number(button.dataset.value);
      });
    });
  });
}

function restoreSelectedStars() {
  document.querySelectorAll(".star-row").forEach((row) => {
    const category = row.dataset.category;
    const rating = selectedRatings[category];
    if (!rating) return;

    row.querySelectorAll(".star-btn").forEach((button) => {
      button.classList.toggle("selected", Number(button.dataset.value) === Number(rating));
    });
  });
}

function validateRatings() {
  return selectedCategories.every((category) => selectedRatings[category]);
}

function calculateUpdatedStreaks(previousStreaks = {}, previousRatings = {}, currentRatings, dateKey) {
  const nextStreaks = { ...previousStreaks };

  selectedCategories.forEach((category) => {
    const prevEntry = previousStreaks[category] || { count: 0, lastDate: null };
    const currentRating = Number(currentRatings[category]);

    if (currentRating < 5) {
      nextStreaks[category] = {
        count: 0,
        lastDate: dateKey,
      };
      return;
    }

    if (!prevEntry.lastDate) {
      nextStreaks[category] = {
        count: 1,
        lastDate: dateKey,
      };
      return;
    }

    const diff = dayDiffFromISO(prevEntry.lastDate, dateKey);

    if (diff === 0) {
      const priorTodayRating = Number(previousRatings?.[category] || 0);
      const keepCount = priorTodayRating === 5 ? prevEntry.count : 1;
      nextStreaks[category] = {
        count: keepCount,
        lastDate: dateKey,
      };
      return;
    }

    if (diff === 1) {
      nextStreaks[category] = {
        count: prevEntry.count + 1,
        lastDate: dateKey,
      };
      return;
    }

    nextStreaks[category] = {
      count: 1,
      lastDate: dateKey,
    };
  });

  return nextStreaks;
}

function buildRewardsFromStreaks(streaks) {
  const rewards = {};
  Object.entries(streaks).forEach(([category, entry]) => {
    rewards[category] = {
      goldStar: entry.count >= 30,
      streak: entry.count,
      updatedAt: todayKey(),
    };
  });
  return rewards;
}

async function loadCheckinState(user) {
  const prefsRef = doc(db, "summaryPreferences", user.uid);
  const prefsSnap = await getDoc(prefsRef);

  if (!prefsSnap.exists()) {
    showOnly(summaryRequiredCard);
    return;
  }

  const prefsData = prefsSnap.data();
  selectedCategories = Array.isArray(prefsData.selectedCategories)
    ? prefsData.selectedCategories
    : [];

  if (!selectedCategories.length) {
    showOnly(summaryRequiredCard);
    return;
  }

  const dailyRef = doc(db, "dailyCheckins", user.uid);
  const dailySnap = await getDoc(dailyRef);
  const dailyData = dailySnap.exists() ? dailySnap.data() : {};

  renderCheckins(selectedCategories, dailyData);
  showOnly(checkinCard);
}

openMenuBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.theme);
  });
});

accountBtn.addEventListener("click", () => {
  if (!currentUser) {
    window.location.href = "accounts.html";
    return;
  }
  openAccountModal();
});

accountModalClose.addEventListener("click", closeAccountModal);

accountModalOverlay.addEventListener("click", (event) => {
  if (event.target === accountModalOverlay) {
    closeAccountModal();
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    closeAccountModal();
    window.location.href = "accounts.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
});

saveCheckinBtn.addEventListener("click", async () => {
  if (!currentUser) {
    showOnly(authRequiredCard);
    return;
  }

  if (!validateRatings()) {
    checkinStatus.textContent = "Please rate your progress for every shown category.";
    return;
  }

  const dateKey = todayKey();
  const dailyRef = doc(db, "dailyCheckins", currentUser.uid);
  const currentSnap = await getDoc(dailyRef);
  const previousData = currentSnap.exists() ? currentSnap.data() : {};

  const nextStreaks = calculateUpdatedStreaks(
    previousData.streaks || {},
    previousData.ratings || {},
    selectedRatings,
    dateKey
  );

  await setDoc(dailyRef, {
    uid: currentUser.uid,
    selectedCategories,
    ratings: selectedRatings,
    streaks: nextStreaks,
    lastCheckinDate: dateKey,
    updatedAt: serverTimestamp(),
  });

  const rewardsRef = doc(db, "goalRewards", currentUser.uid);
  await setDoc(rewardsRef, {
    uid: currentUser.uid,
    rewards: buildRewardsFromStreaks(nextStreaks),
    updatedAt: serverTimestamp(),
  });

  checkinStatus.textContent = "Your daily check-in was saved.";
  await loadCheckinState(currentUser);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    showOnly(authRequiredCard);
    return;
  }

  currentUser = user;
  await loadCheckinState(user);
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}