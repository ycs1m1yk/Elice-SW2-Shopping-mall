const slideWrap = document.querySelector(".slide-container");
const slideList = document.querySelector(".slide-list");
const slideItems = document.querySelectorAll(".slide-items");
const firstItem = document.querySelector(".slide-items:first-child");
const lastItem = document.querySelector(".slide-items:last-child");
const slideLen = slideItems.length;
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const playBtn = document.querySelector(".play");
const pauseBtn = document.querySelector(".pause");
const selectedCategoryImage = slideList.querySelectorAll(".category-image");

const active = "slide_active";
let playId;
let slideWidth = 100;
let startNum = 0;
let carIndex;
let carSlide;
let contsWidth = slideWidth / (slideLen + 2);

const firstNode = firstItem.cloneNode(true);
const lastNode = lastItem.cloneNode(true);
firstNode.style.width = contsWidth + "%";
lastNode.style.width = contsWidth + "%";

slideList.appendChild(firstNode);
slideList.insertBefore(lastNode, slideList.firstElementChild);

slideWrap.style.overflow = "hidden";
slideList.style.width = slideWidth * (slideLen + 2) + "%";
for (let i = 0; i < slideLen; i++) {
  slideItems[i].style.width = contsWidth + "%";
}
slideList.style.transform = `translate(-${contsWidth * (startNum + 1)}% , 0)`;

carIndex = startNum;
carSlide = slideItems[carIndex];
carSlide.classList.add(active);

// 다음 슬라이드로 이동
const nextEvent = () => {
  if (carIndex <= slideLen - 1) {
    slideList.style.transition = "all 0.3s";
    slideList.style.transform = `translate(-${
      contsWidth * (carIndex + 2)
    }%, 0)`;
  }
  if (carIndex === slideLen - 1) {
    setTimeout(function () {
      slideList.style.transition = "0s";
      slideList.style.transform = `translate(-${contsWidth}%, 0)`;
    }, 300);
    carIndex = -1;
  }
  carSlide.classList.remove(active);
  carSlide = slideItems[++carIndex];
  carSlide.classList.add(active);
};

// 이전 슬라이드로 이동
const prevEvent = () => {
  if (carIndex >= 0) {
    slideList.style.transition = "all 0.3s";
    slideList.style.transform = `translate(-${contsWidth * carIndex}%, 0)`;
  }
  if (carIndex === 0) {
    setTimeout(function () {
      slideList.style.transition = "0s";
      slideList.style.transform = `translate(-${contsWidth * slideLen}%, 0)`;
    }, 300);
    carIndex = slideLen;
  }
  carSlide.classList.remove(active);
  carSlide = slideItems[--carIndex];
  carSlide.classList.add(active);
};

// Slide 관련 이벤트 핸들러
const handleNextButtonClick = () => {
  nextEvent();
};

const handlePrevButtonClick = () => {
  prevEvent();
};

const handlePlayButtonClick = () => {
  playId = setInterval(nextEvent, 3000);
  playBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
};
const handlePauseButtonClick = () => {
  clearInterval(playId);
  pauseBtn.style.display = "none";
  playBtn.style.display = "inline-block";
};

// Slide 이미지 클릭했을 때 해당 카테고리로 이동
const handleSelectedCategoryImageClick = (e) => {
  const category = e.target.name;
  window.location.href = `/product/list/?category=${category}`;
};

// 이벤트 등록
nextBtn.addEventListener("click", handleNextButtonClick);
prevBtn.addEventListener("click", handlePrevButtonClick);
playBtn.addEventListener("click", handlePlayButtonClick);
pauseBtn.addEventListener("click", handlePauseButtonClick);

for (const target of selectedCategoryImage) {
  target.addEventListener("click", handleSelectedCategoryImageClick);
}

// 페이지 로딩이 끝나면 슬라이드 바로 시작
window.onload = () => {
  handlePlayButtonClick();
};
