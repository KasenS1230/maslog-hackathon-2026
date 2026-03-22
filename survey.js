import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
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

const surveyPage = document.getElementById("surveyPage");
const sideMenu = document.getElementById("sideMenu");
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const accountBtn = document.getElementById("accountBtn");
const accountModalOverlay = document.getElementById("accountModalOverlay");
const accountModalClose = document.getElementById("accountModalClose");
const accountEmail = document.getElementById("accountEmail");
const logoutBtn = document.getElementById("logoutBtn");
const themeButtons = document.querySelectorAll(".theme-option");

const authRequiredCard = document.getElementById("authRequiredCard");
const existingSurveyCard = document.getElementById("existingSurveyCard");
const surveyFormCard = document.getElementById("surveyFormCard");
const surveyCompleteCard = document.getElementById("surveyCompleteCard");

const retakeBtn = document.getElementById("retakeBtn");
const continueBtn = document.getElementById("continueBtn");
const surveyForm = document.getElementById("surveyForm");
const surveyStatus = document.getElementById("surveyStatus");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let currentUser = null;
let currentAnswers = {};

function openMenu() {
  sideMenu.classList.add("open");
  menuOverlay.classList.add("show");
}

function closeMenu() {
  sideMenu.classList.remove("open");
  menuOverlay.classList.remove("show");
}

function setTheme(themeName) {
  surveyPage.classList.remove(...themeClasses);
  surveyPage.classList.add(`theme-${themeName}`);

  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === themeName);
  });

  localStorage.setItem("maslogTheme", themeName);
}

function showOnly(card) {
  [authRequiredCard, existingSurveyCard, surveyFormCard, surveyCompleteCard].forEach((section) => {
    section.classList.add("hidden");
  });
  card.classList.remove("hidden");
}

function bindEmojiButtons() {
  document.querySelectorAll(".emoji-scale").forEach((scale) => {
    const questionKey = scale.dataset.question;
    const buttons = scale.querySelectorAll(".emoji-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("selected"));
        button.classList.add("selected");
        currentAnswers[questionKey] = Number(button.dataset.value);
      });
    });
  });
}

function fillSurveyUI(answers) {
  currentAnswers = { ...answers };

  document.querySelectorAll(".emoji-scale").forEach((scale) => {
    const questionKey = scale.dataset.question;
    const buttons = scale.querySelectorAll(".emoji-btn");

    buttons.forEach((button) => {
      button.classList.toggle(
        "selected",
        Number(button.dataset.value) === Number(answers[questionKey])
      );
    });
  });
}

function validateAllAnswered() {
  const requiredQuestions = [
    "phys_q1", "phys_q2", "phys_q3",
    "safety_q1", "safety_q2", "safety_q3",
    "social_q1", "social_q2", "social_q3",
    "esteem_q1", "esteem_q2", "esteem_q3",
  ];

  return requiredQuestions.every((key) => currentAnswers[key]);
}

function calculateCategoryScores(answers) {
  return {
    physiological: answers.phys_q1 + answers.phys_q2 + answers.phys_q3,
    safety: answers.safety_q1 + answers.safety_q2 + answers.safety_q3,
    social: answers.social_q1 + answers.social_q2 + answers.social_q3,
    esteem: answers.esteem_q1 + answers.esteem_q2 + answers.esteem_q3,
  };
}

async function loadSurveyState(user) {
  const surveyRef = doc(db, "surveyResponses", user.uid);
  const surveySnap = await getDoc(surveyRef);

  if (!surveySnap.exists()) {
    currentAnswers = {};
    showOnly(surveyFormCard);
    return;
  }

  const data = surveySnap.data();
  fillSurveyUI(data.answers || {});
  showOnly(existingSurveyCard);
}

function openAccountModal() {
  if (currentUser) {
    accountEmail.textContent =
      currentUser.email || "Unknown";
  }

  accountModalOverlay.classList.add("show");
}

function closeAccountModal() {
  accountModalOverlay.classList.remove("show");
}

accountBtn.addEventListener("click", () => {
  if (!currentUser) {
    window.location.href = "accounts.html";
    return;
  }

  openAccountModal();
});

accountModalClose.addEventListener(
  "click",
  closeAccountModal
);

accountModalOverlay.addEventListener(
  "click",
  (event) => {
    if (event.target === accountModalOverlay) {
      closeAccountModal();
    }
  }
);

logoutBtn.addEventListener(
  "click",
  async () => {
    await auth.signOut();
    window.location.href = "accounts.html";
  }
);

openMenuBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.theme);
  });
});

retakeBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const surveyRef = doc(db, "surveyResponses", currentUser.uid);
  await deleteDoc(surveyRef);

  currentAnswers = {};
  document.querySelectorAll(".emoji-btn").forEach((btn) => btn.classList.remove("selected"));
  surveyStatus.textContent = "";
  showOnly(surveyFormCard);
});

continueBtn.addEventListener("click", () => {
  window.location.href = "advice.html";
});

surveyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showOnly(authRequiredCard);
    return;
  }

  if (!validateAllAnswered()) {
    surveyStatus.textContent = "Please answer every question before submitting.";
    return;
  }

  const categoryScores = calculateCategoryScores(currentAnswers);

  const surveyRef = doc(db, "surveyResponses", currentUser.uid);

  await setDoc(surveyRef, {
    uid: currentUser.uid,
    email: currentUser.email || "",
    answers: currentAnswers,
    categoryScores,
    completed: true,
    updatedAt: serverTimestamp(),
  });

  surveyStatus.textContent = "";
  showOnly(surveyCompleteCard);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    showOnly(authRequiredCard);
    return;
  }

  currentUser = user;
  await loadSurveyState(user);
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}

bindEmojiButtons();