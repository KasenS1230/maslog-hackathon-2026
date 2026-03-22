import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

const accountPage = document.getElementById("accountPage");
const sideMenu = document.getElementById("sideMenu");
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const themeButtons = document.querySelectorAll(".theme-option");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const accountForm = document.getElementById("accountForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const statusMessage = document.getElementById("statusMessage");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let isLoggingIn = true;

function openMenu() {
  sideMenu.classList.add("open");
  menuOverlay.classList.add("show");
}

function closeMenu() {
  sideMenu.classList.remove("open");
  menuOverlay.classList.remove("show");
}

function setTheme(themeName) {
  accountPage.classList.remove(...themeClasses);
  accountPage.classList.add(`theme-${themeName}`);

  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === themeName);
  });

  localStorage.setItem("maslogTheme", themeName);
}

function updateFormMode() {
  formTitle.textContent = isLoggingIn ? "Login" : "Create Account";
  formSubtitle.textContent = isLoggingIn
    ? "We're so excited to see you back!"
    : "Start your MASLOG journey with a fresh account.";
  submitBtn.textContent = isLoggingIn ? "Login" : "Sign Up";
  toggleFormBtn.textContent = isLoggingIn
    ? "Don’t have an account? Sign Up"
    : "Already have an account? Log In";
  statusMessage.textContent = "";
}

openMenuBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.theme);
  });
});

toggleFormBtn.addEventListener("click", () => {
  isLoggingIn = !isLoggingIn;
  updateFormMode();
});

accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  statusMessage.textContent = "";

  try {
    if (isLoggingIn) {
      await signInWithEmailAndPassword(auth, email, password);
      statusMessage.textContent = "Logged in successfully.";
      window.location.href = "goals.html";
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      statusMessage.textContent = "Account created successfully.";
      window.location.href = "goals.html";
    }
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}

updateFormMode();