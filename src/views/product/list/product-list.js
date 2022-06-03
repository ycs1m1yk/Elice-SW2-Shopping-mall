import * as Api from "/api.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);
const producItemContainer = document.getElementById("producItemContainer"); // API를 통해 호출된 데이터로 만든 엘리먼트가 추가될 엘리먼트

const paintProductList = (productList) => {
  productList.forEach((product) => {
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

    producItemContainer.append(itemCard);
    document.querySelector(`.content${product._id}`).append(tags);
  });
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
    categoryLink.style = "font-size: 24px";

    categoryLi.appendChild(categoryLink);
    categoryMenu.appendChild(categoryLi);
  });
};

// 카테고리에 맞는 상품을 불러오는 API
const getDataFromApi = async () => {
  const url = new URL(location.href);
  const category = url.searchParams.get("category"); // 현재 선택한 카테고리

  // 카테고리에 맞는 상품 리스트 요청
  const productList = await Api.get("/api/product/category", category);
  const categoryList = await Api.get("/api/category");

  paintCategoryMenu(categoryList);
  paintProductList(productList);
};

getDataFromApi();
