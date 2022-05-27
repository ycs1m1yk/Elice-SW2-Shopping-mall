import * as Api from "/api.js";
import header from "/components/Header.js";

/*
Grid 형태로 화면에 출력

예시 이미지: "https://images.unsplash.com/photo-1653257340129-148be674836c?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300"

Image
title
shortDescription
price
brandName 
[keyword]

참조: http://www.leelin.co.kr/shop/shopbrand.html?type=X&xcode=026
*/

document.body.insertAdjacentElement("afterbegin", header);
const producItemContainer = document.getElementById("producItemContainer"); // API를 통해 호출된 데이터로 만든 엘리먼트가 추가될 엘리먼트

const paintProductList = (productList) => {
  // console.log(productList);
  productList.map((product, index) => {
    const productLink = document.createElement("div"); // 포스터 눌렀을 때 제품 상세 페이지로 이동
    const productImage = document.createElement("img"); // product.img
    const productTitle = document.createElement("div"); // product.name
    const productDesc = document.createElement("div"); // product.shortDescription
    const productKeyword = document.createElement("span"); // product.keyword[]
    const productBrand = document.createElement("div"); // product.brandName
    const productPrice = document.createElement("div"); // product.price;

    // 포스터 이미지
    productImage.style.backgroundImage =
      "url('https://images.unsplash.com/photo-1653257340129-148be674836c?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300')";

    // 상품 정보
    productTitle.innerText = product.name;
    productDesc.innerText = product.shortDescription;
    productBrand.innerText = product.brandName;
    productPrice.innerText = product.price;

    productLink.append(
      productImage,
      productTitle,
      productDesc,
      productPrice,
      productBrand
    );

    producItemContainer.append(productLink);
    productLink.onclick = () => {
      window.location.href = `/product/detail/?id=${product._id}`;
    };
    productLink.style.cursor = "pointer";
  });
};

// 카테고리에 맞는 상품을 불러오는 API
const getDataFromApi = async () => {
  const url = new URL(location.href);
  const category = url.searchParams.get("category"); // 현재 선택한 카테고리

  // 카테고리에 맞는 상품 리스트 요청
  const productList = await Api.get("/api/product/list/category", category);

  // TODO: API를 통해 받아온 모든 상품들을 순회하면서 동적으로 producItemContainer에 추가
  paintProductList(productList);
};

getDataFromApi();
