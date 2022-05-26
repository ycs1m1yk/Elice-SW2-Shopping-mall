import * as Api from "/api.js";

const producItemContainer = document.getElementById("producItemContainer"); // API를 통해 호출된 데이터로 만든 엘리먼트가 추가될 엘리먼트

// 카테고리에 맞는 상품을 불러오는 API
const getDataFromApi = async () => {
  const category = window.location.search.split("=")[1]; // 현재 선택한 카테고리

  // 카테고리에 맞는 상품 리스트 요청
  const productList = await Api.get("/api/productlist/category", category);

  // TODO: API를 통해 받아온 모든 상품들을 순회하면서 동적으로 producItemContainer에 추가
};

getDataFromApi();
