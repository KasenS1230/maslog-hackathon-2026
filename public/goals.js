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

const goalsPage = document.getElementById("goalsPage");
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
const goalsCard = document.getElementById("goalsCard");

const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailStatusRow = document.getElementById("detailStatusRow");
const detailMeaning = document.getElementById("detailMeaning");
const detailImproveList = document.getElementById("detailImproveList");
const detailProgress = document.getElementById("detailProgress");

const celebrationOverlay = document.getElementById("celebrationOverlay");
const closeCelebrationBtn = document.getElementById("closeCelebrationBtn");

const pyramidButtons = document.querySelectorAll(".triangle-layer");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let currentUser = null;
let selectedCategories = [];
let streaks = {};
let rewards = {};
let activeCategory = "physiological";

const categoryMeta = {
  self: {
    title: "Self-Actualization",
    subtitle: "Growth, purpose, fulfillment, and becoming the fullest version of yourself.",
    meaning:
      "Self-Actualization represents the top of the Maslow pyramid. It is about growth beyond survival: living with purpose, creativity, reflection, and a strong sense of personal direction. This layer becomes more realistic when the lower layers are stable.",
    improve: [
      "Set one meaningful long-term goal that reflects the kind of person you want to become.",
      "Make time for reflection, journaling, or quiet thinking about your direction.",
      "Keep strengthening the lower categories so you have the stability to grow higher.",
      "Look for ways to express creativity, contribution, or personal purpose."
    ]
  },
  esteem: {
    title: "Esteem",
    subtitle: "Confidence, accomplishment, self-respect, and trusting your abilities.",
    meaning:
      "Esteem is about feeling capable, proud of your effort, and confident that you can handle challenges. It also includes self-respect and the belief that your actions matter.",
    improve: [
      "Set smaller, finishable goals so you can build consistent wins.",
      "Track effort, not just outcomes, so you can see your progress clearly.",
      "Practice positive self-talk after difficult days instead of self-dismissal.",
      "Take on one challenge at a time and let completed work build confidence."
    ]
  },
  social: {
    title: "Love & Belonging",
    subtitle: "Connection, support, friendship, closeness, and feeling part of something.",
    meaning:
      "Love and Belonging is the need for healthy relationships and emotional connection. It includes support systems, friendship, family bonds, and the ability to feel seen and valued by others.",
    improve: [
      "Reach out to one person intentionally, even with a short message.",
      "Spend time building quality interaction, not just passive social contact.",
      "Be honest about needing support when life feels heavier than usual.",
      "Protect relationships that make you feel safe, respected, and understood."
    ]
  },
  safety: {
    title: "Safety",
    subtitle: "Security, consistency, predictability, and emotional steadiness.",
    meaning:
      "Safety is about feeling secure in your environment and your routine. It includes stability, manageable stress, emotional grounding, and a sense that life is not constantly in crisis.",
    improve: [
      "Build a simple daily routine you can realistically maintain.",
      "Reduce unnecessary chaos by planning the next day in advance.",
      "Create one space in your life that feels calm, organized, and predictable.",
      "Break stress into smaller pieces instead of carrying everything at once."
    ]
  },
  physiological: {
    title: "Physiological",
    subtitle: "Sleep, hydration, food, rest, and the basic needs of your body.",
    meaning:
      "Physiological needs are the foundation of the entire pyramid. These include sleep, food, hydration, energy, and rest. If this layer is weak, every higher layer becomes harder to maintain.",
    improve: [
      "Improve one basic habit first: sleep, hydration, meals, or physical rest.",
      "Avoid skipping basic self-care when life gets busy or stressful.",
      "Treat energy management as a real need, not a luxury.",
      "Focus on consistency over perfection with body-level care."
    ]
  }
};

const prerequisites = {
  physiological: [],
  safety: ["physiological"],
  social: ["physiological", "safety"],
  esteem: ["physiological", "safety", "social"],
  self: ["physiological", "safety", "social", "esteem"],
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
  goalsPage.classList.remove(...themeClasses);
  goalsPage.classList.add(`theme-${themeName}`);

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
  [authRequiredCard, summaryRequiredCard, goalsCard].forEach((section) => {
    section.classList.add("hidden");
  });
  card.classList.remove("hidden");
}

function isGold(categoryKey) {
  if (categoryKey === "self") return false;
  return Boolean(rewards?.[categoryKey]?.goldStar) || Number(streaks?.[categoryKey]?.count || 0) >= 30;
}

function allBaseGold() {
  return ["physiological", "safety", "social", "esteem"].every(isGold);
}

function recommendedLowerCategories() {
  const recommended = new Set();

  selectedCategories.forEach((category) => {
    const needed = prerequisites[category] || [];
    needed.forEach((lowerCategory) => {
      if (!selectedCategories.includes(lowerCategory)) {
        recommended.add(lowerCategory);
      }
    });
  });

  return recommended;
}

function renderPyramidStates() {
  const recommended = recommendedLowerCategories();

  pyramidButtons.forEach((button) => {
    const category = button.dataset.category;
    const star = button.querySelector(".gold-star");

    button.classList.remove(
      "selected-focus",
      "recommended-lower",
      "default-state",
      "active-detail",
      "completed-self"
    );

    if (category === "self") {
      if (allBaseGold()) {
        button.classList.add("completed-self");
      } else {
        button.classList.add("default-state");
      }
    } else if (selectedCategories.includes(category)) {
      button.classList.add("selected-focus");
    } else if (recommended.has(category)) {
      button.classList.add("recommended-lower");
    } else {
      button.classList.add("default-state");
    }

    if (category === activeCategory) {
      button.classList.add("active-detail");
    }

    if (star) {
      star.classList.toggle("show", isGold(category));
    }
  });
}

function createChip(label, className = "") {
  const chip = document.createElement("div");
  chip.className = `status-chip ${className}`.trim();
  chip.textContent = label;
  return chip;
}

function formatDate(dateStr) {
  if (!dateStr) return "No check-in yet";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString();
}

function renderDetail(category) {
  const meta = categoryMeta[category];
  const streakCount = Number(streaks?.[category]?.count || 0);
  const lastDate = streaks?.[category]?.lastDate || null;
  const selected = selectedCategories.includes(category);
  const recommended = recommendedLowerCategories().has(category);
  const gold = isGold(category);

  detailTitle.textContent = meta.title;
  detailSubtitle.textContent = meta.subtitle;
  detailMeaning.textContent = meta.meaning;

  detailImproveList.innerHTML = "";
  meta.improve.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    detailImproveList.appendChild(li);
  });

  detailStatusRow.innerHTML = "";

  if (category === "self") {
    if (allBaseGold()) {
      detailStatusRow.appendChild(createChip("Triangle complete", "gold"));
      detailProgress.textContent =
        "You completed all four foundational categories below Self-Actualization. This is the strongest state of the pyramid in MASLOG.";
    } else {
      detailStatusRow.appendChild(createChip("Build the lower layers first"));
      detailProgress.textContent =
        "Self-Actualization grows best when the four categories below it are healthy. Keep strengthening the base of the pyramid to fully support this level.";
    }
  } else {
    detailStatusRow.appendChild(createChip(`Streak: ${streakCount} day${streakCount === 1 ? "" : "s"}`));

    if (selected) {
      detailStatusRow.appendChild(createChip("Current focus", "focus"));
    } else if (recommended) {
      detailStatusRow.appendChild(createChip("Foundational support recommended", "good"));
    } else {
      detailStatusRow.appendChild(createChip("Not selected yet"));
    }

    if (gold) {
      detailStatusRow.appendChild(createChip("Gold star earned", "gold"));
    }

    detailProgress.textContent =
      `Last check-in for this category: ${formatDate(lastDate)}. ` +
      `This category ${selected ? "is currently in your chosen focus set" : recommended ? "isn't selected, but it supports one of your higher selected categories" : "is currently untouched in your selected focus set"}.`;
  }

  activeCategory = category;
  renderPyramidStates();
}

function maybeShowCelebration() {
  if (!currentUser || !allBaseGold()) return;

  const dismissedKey = `maslog-triangle-complete-dismissed-${currentUser.uid}`;
  const dismissed = localStorage.getItem(dismissedKey);

  if (!dismissed) {
    celebrationOverlay.classList.add("show");
  }
}

async function loadGoalsState(user) {
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

  const checkinRef = doc(db, "dailyCheckins", user.uid);
  const checkinSnap = await getDoc(checkinRef);
  const checkinData = checkinSnap.exists() ? checkinSnap.data() : {};
  streaks = checkinData.streaks || {};

  const rewardsRef = doc(db, "goalRewards", user.uid);
  const rewardsSnap = await getDoc(rewardsRef);
  const rewardsData = rewardsSnap.exists() ? rewardsSnap.data() : {};
  rewards = rewardsData.rewards || {};

  showOnly(goalsCard);
  renderPyramidStates();

  const defaultCategory = selectedCategories[0] || "physiological";
  renderDetail(defaultCategory);

  maybeShowCelebration();
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

pyramidButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderDetail(button.dataset.category);
  });
});

closeCelebrationBtn.addEventListener("click", () => {
  celebrationOverlay.classList.remove("show");
  if (currentUser) {
    const dismissedKey = `maslog-triangle-complete-dismissed-${currentUser.uid}`;
    localStorage.setItem(dismissedKey, "true");
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    showOnly(authRequiredCard);
    return;
  }

  currentUser = user;
  await loadGoalsState(user);
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}