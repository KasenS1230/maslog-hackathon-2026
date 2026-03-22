import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let currentUser = null;

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
  accountModalOverlay.classList.add("show");
}

function closeAccountModal() {
  accountModalOverlay.classList.remove("show");
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

  accountEmail.textContent = currentUser.email || "No email available";
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

const authRequiredCard =
  document.getElementById("authRequiredCard");

const goalsCard =
  document.getElementById("goalsCard");

function showOnly(card) {
  authRequiredCard.classList.add("hidden");
  goalsCard.classList.add("hidden");

  card.classList.remove("hidden");
}

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;

  if (!user) {
    showOnly(authRequiredCard);
    return;
  }

  showOnly(goalsCard);
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}