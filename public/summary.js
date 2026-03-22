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

const summaryPage = document.getElementById("summaryPage");
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
const surveyRequiredCard = document.getElementById("surveyRequiredCard");
const summaryCard = document.getElementById("summaryCard");

const focusTags = document.getElementById("focusTags");
const summaryList = document.getElementById("summaryList");
const customizeBtn = document.getElementById("customizeBtn");
const customizePanel = document.getElementById("customizePanel");
const savePreferencesBtn = document.getElementById("savePreferencesBtn");
const summaryStatus = document.getElementById("summaryStatus");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let currentUser = null;
let currentSurveyData = null;
let currentRecommendedCategories = [];

const categoryMeta = {
  physiological: {
    title: "Physiological Well-Being",
    summary:
      "Your responses suggest your body-level needs may need more support right now, especially with habits like sleep, energy, or nourishment.",
  },
  safety: {
    title: "Safety & Stability",
    summary:
      "Your responses suggest you may benefit from strengthening routine, reducing overwhelm, and creating more predictability in daily life.",
  },
  social: {
    title: "Social Connection & Belonging",
    summary:
      "Your responses suggest connection may need more attention, including support, comfort reaching out, and meaningful interaction.",
  },
  esteem: {
    title: "Esteem & Confidence",
    summary:
      "Your responses suggest confidence and motivation may be an area to rebuild through smaller wins and steady self-trust.",
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
  summaryPage.classList.remove(...themeClasses);
  summaryPage.classList.add(`theme-${themeName}`);

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
  [authRequiredCard, surveyRequiredCard, summaryCard].forEach((section) => {
    section.classList.add("hidden");
  });

  card.classList.remove("hidden");
}

function getLowestCategories(categoryScores) {
  const entries = Object.entries(categoryScores);
  const minScore = Math.min(...entries.map(([, value]) => value));
  return entries
    .filter(([, value]) => value === minScore)
    .map(([key]) => key);
}

function renderFocusAreas(categories) {
  focusTags.innerHTML = "";
  summaryList.innerHTML = "";

  categories.forEach((categoryKey) => {
    const tag = document.createElement("div");
    tag.className = "focus-tag";
    tag.textContent = categoryMeta[categoryKey].title;
    focusTags.appendChild(tag);

    const item = document.createElement("div");
    item.className = "summary-item";
    item.innerHTML = `
      <h3>${categoryMeta[categoryKey].title}</h3>
      <p>${categoryMeta[categoryKey].summary}</p>
    `;
    summaryList.appendChild(item);
  });
}

function syncCustomizeCheckboxes(selectedCategories) {
  const checkboxes = customizePanel.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectedCategories.includes(checkbox.value);
  });
}

async function loadSummaryState(user) {
  const surveyRef = doc(db, "surveyResponses", user.uid);
  const surveySnap = await getDoc(surveyRef);

  if (!surveySnap.exists()) {
    showOnly(surveyRequiredCard);
    return;
  }

  currentSurveyData = surveySnap.data();
  const categoryScores = currentSurveyData.categoryScores || {};
  const surveyRecommended = getLowestCategories(categoryScores);

  const prefsRef = doc(db, "summaryPreferences", user.uid);
  const prefsSnap = await getDoc(prefsRef);

  if (prefsSnap.exists()) {
    const prefsData = prefsSnap.data();
    currentRecommendedCategories =
      prefsData.selectedCategories && prefsData.selectedCategories.length > 0
        ? prefsData.selectedCategories
        : surveyRecommended;
  } else {
    currentRecommendedCategories = surveyRecommended;
  }

  renderFocusAreas(currentRecommendedCategories);
  syncCustomizeCheckboxes(currentRecommendedCategories);
  summaryStatus.textContent = "";
  showOnly(summaryCard);
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

customizeBtn.addEventListener("click", () => {
  customizePanel.classList.toggle("hidden");
});

savePreferencesBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const selectedCategories = Array.from(
    customizePanel.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);

  if (selectedCategories.length === 0) {
    summaryStatus.textContent =
      "Choose at least one category to focus on before saving.";
    return;
  }

  const prefsRef = doc(db, "summaryPreferences", currentUser.uid);

  await setDoc(prefsRef, {
    uid: currentUser.uid,
    selectedCategories,
    updatedAt: serverTimestamp(),
  });

  currentRecommendedCategories = selectedCategories;
  renderFocusAreas(currentRecommendedCategories);
  summaryStatus.textContent = "Your focus preferences were saved.";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    showOnly(authRequiredCard);
    return;
  }

  currentUser = user;
  await loadSummaryState(user);
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}