import header from "/components/Header.js";
import * as Api from "/api.js";

document.body.insertAdjacentElement("afterbegin", header);
const productItemContainer = document.getElementById("productItemContainer");

// 슬라이더 이미지 생성 함수
const setSliderImage = (categoryList) => {
  const slideList = document.querySelector(".slide-list");

  categoryList.forEach((category) => {
    const slideItemDiv = document.createElement("div");
    const figure = document.createElement("figure");
    const slideItemLink = document.createElement("a");
    const slideItemImage = document.createElement("img");

    // 필요 속성 추가
    slideItemDiv.classList.add("slide-items");
    slideItemLink.classList.add("category-image");
    slideItemLink.href = `/product/list?category=${category.name}`;
    slideItemImage.style = "width: 100%; height: 600px";
    slideItemImage.src = `${category.img}`;

    // 자식 노드로 추가
    slideItemLink.appendChild(slideItemImage);
    figure.appendChild(slideItemLink);
    slideItemDiv.appendChild(figure);
    slideList.appendChild(slideItemDiv);
  });
};

// Slider 생성 함수
const slider = (categoryList) => {
  setSliderImage(categoryList); // 슬라이더 아이템 미리 생성

  const slideWrap = document.querySelector(".slide-container");
  const slideItems = document.querySelectorAll(".slide-items");
  const slideList = document.querySelector(".slide-list");
  const firstItem = document.querySelector(".slide-items:first-child");
  const lastItem = document.querySelector(".slide-items:last-child");
  const slideLen = slideItems.length;
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const playBtn = document.querySelector(".play");
  const pauseBtn = document.querySelector(".pause");

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

  // 이벤트 등록
  nextBtn.addEventListener("click", handleNextButtonClick);
  prevBtn.addEventListener("click", handlePrevButtonClick);
  playBtn.addEventListener("click", handlePlayButtonClick);
  pauseBtn.addEventListener("click", handlePauseButtonClick);

  // 슬라이더 바로 시작
  handlePlayButtonClick();
};

// 카테고리 메뉴 생성 함수
const paintCategoryMenu = (categoryList) => {
  const categoryMenu = document.querySelector(".categories");

  categoryList.forEach((category) => {
    const categoryLi = document.createElement("li");
    const categoryLink = document.createElement("a");

    categoryLink.classList.add("navbar-item");
    categoryLink.href = `/product/list?category=${category.name}`;
    categoryLink.innerText = `${category.name.replace(" Clothes", "")}`;
    categoryLink.style = `font-size: 24px`;

    categoryLi.appendChild(categoryLink);
    categoryMenu.appendChild(categoryLi);
  });
};

// 추천 상품 화면에 그리기
const paintProduct = (product) => {
  let itemCard = document.createElement("a");
  let tags = document.createElement("div");

  tags.id = "tagContainer";
  itemCard.classList.add("card");

  itemCard.href = `/product/detail/?id=${product._id}`;

  itemCard.innerHTML = `
    <div class="card-image">
      <figure class="image is-4by3">
        <img src="${product.img}" alt="Placeholder image">
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          
        </div>
        <div class="media-content">
          <p class="title is-4">${product.name}</p>
          <p class="subtitle is-6">${product.shortDescription}</p>
        </div>
      </div>

      <div class="content${product._id}">
        <div style="margin-bottom: 1rem" id="itemPrice"><b>가격: ${product.price.toLocaleString()}원</b></div>
      </div>
    </div>
    `;

  // 상품 키워드 태그 추가
  product.keyword.forEach((keyword) => {
    let tag = document.createElement("span");

    tag.classList.add("tag");
    tag.classList.add("is-sucess");
    tag.innerText = keyword;

    tags.append(tag);
  });

  productItemContainer.append(itemCard);
  document.querySelector(`.content${product._id}`).append(tags);
};

// 랜덤 추천 상품 호출
const todayRecommendation = (productList) => {
  for (let i = 0; i < 3; i++) {
    const randomeIdx = Math.floor(Math.random() * productList.length);
    paintProduct(productList[randomeIdx]);
  }
};

// 데이터 받아와서 화면 그리기
const getDataFromApi = async () => {
  const categoryList = await Api.get("/api/category");
  const productList = await Api.get("/api/product");

  paintCategoryMenu(categoryList);
  slider(categoryList);
  todayRecommendation(productList);
};

getDataFromApi();
