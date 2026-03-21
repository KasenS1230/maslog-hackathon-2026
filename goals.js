const goalsPage = document.getElementById("goalsPage");
const sideMenu = document.getElementById("sideMenu");
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const themeButtons = document.querySelectorAll(".theme-option");

const themeClasses = [
  "theme-blossom",
  "theme-sunflower",
  "theme-lavender",
  "theme-rose",
];

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

openMenuBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.theme);
  });
});

const savedTheme = localStorage.getItem("maslogTheme");
if (savedTheme && themeClasses.includes(`theme-${savedTheme}`)) {
  setTheme(savedTheme);
}