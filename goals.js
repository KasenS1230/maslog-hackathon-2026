const goalsPage = document.getElementById("goalsPage");
const sideMenu = document.getElementById("sideMenu");
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const boxSelf = document.getElementById("Box_Self");
const boxEst = document.getElementById("Box_Esteem");
const boxLB = document.getElementById("Box_LB");
const boxSafe = document.getElementById("Box_Safe");
const boxPhys = document.getElementById("Box_Phys");
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

function toggleSelf(){
  boxSelf.style.opacity = "1";
  boxSelf.style.visibility = "visible";
  boxSelf.style.transition = "all 0.5s ease-in";
}

function toggleCloseSelf(){
  boxSelf.style.opacity = "0";
  boxSelf.style.visibility = "hidden";
}

function toggleEst(){
  boxEst.style.opacity = "1";
  boxEst.style.visibility = "visible";
  boxEst.style.transition = "all 0.5s ease-in";
}

function toggleCloseEst(){
  boxEst.style.opacity = "0";
  boxEst.style.visibility = "hidden";
}

function toggleLB(){
  boxLB.style.opacity = "1";
  boxLB.style.visibility = "visible";
  boxLB.style.transition = "all 0.5s ease-in";
}

function toggleCloseLB(){
  boxLB.style.opacity = "0";
  boxLB.style.visibility = "hidden";
}

function toggleSafe(){
  boxSafe.style.opacity = "1";
  boxSafe.style.visibility = "visible";
  boxSafe.style.transition = "all 0.5s ease-in";
}

function toggleCloseSafe(){
  boxSafe.style.opacity = "0";
  boxSafe.style.visibility = "hidden";
}

function togglePhys(){
  boxPhys.style.opacity = "1";
  boxPhys.style.visibility = "visible";
  boxPhys.style.transition = "all 0.5s ease-in";
}

function toggleClosePhys(){
  boxPhys.style.opacity = "0";
  boxPhys.style.visibility = "hidden";
}
