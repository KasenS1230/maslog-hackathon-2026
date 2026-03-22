import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
const themeSelect = document.getElementById("themeSelect");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const accountForm = document.getElementById("accountForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const statusMessage = document.getElementById("statusMessage");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

let isLoggingIn = true;

function setTheme(themeName) {
  accountPage.classList.remove(...themeClasses);
  accountPage.classList.add(`theme-${themeName}`);
  themeSelect.value = themeName;
  localStorage.setItem("maslogTheme", themeName);
}

function updateFormMode() {
  formTitle.textContent = isLoggingIn ? "Log In" : "Create Account";
  formSubtitle.textContent = isLoggingIn
    ? "Welcome back to MASLOG."
    : "Plant a new account and start growing with MASLOG.";
  submitBtn.textContent = isLoggingIn ? "Log In" : "Sign Up";
  toggleFormBtn.textContent = isLoggingIn
    ? "Don’t have an account? Sign Up"
    : "Already have an account? Log In";

  confirmPasswordGroup.classList.toggle("hidden", isLoggingIn);
  confirmPasswordInput.required = !isLoggingIn;
  resetPasswordBtn.classList.toggle("hidden", !isLoggingIn);

  statusMessage.textContent = "";
  confirmPasswordInput.value = "";
}

themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);
});

toggleFormBtn.addEventListener("click", () => {
  isLoggingIn = !isLoggingIn;
  updateFormMode();
});

resetPasswordBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    statusMessage.textContent = "Enter your email.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    statusMessage.textContent = "Password reset email sent. Check your inbox.";
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});

accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  statusMessage.textContent = "";

  if (!isLoggingIn) {
    if (password !== confirmPassword) {
      statusMessage.textContent = "Passwords do not match.";
      return;
    }

    if (password.length < 6) {
      statusMessage.textContent = "Password should be at least 6 characters.";
      return;
    }
  }

  try {
    if (isLoggingIn) {
      await signInWithEmailAndPassword(auth, email, password);
      statusMessage.textContent = "Logged in successfully.";
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      statusMessage.textContent = "Account created successfully.";
    }

    window.location.href = "goals.html";
  } catch (error) {
    statusMessage.textContent = "Email or password does not exist.";
  }
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
} else {
  setTheme("blossom");
}

updateFormMode();