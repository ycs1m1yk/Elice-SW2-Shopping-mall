import * as Api from "/api.js";
import header from "/components/Header.js";

/**
TODO

1. 장바구니 추가 버튼 누를 시 
  1)LocalStorage 저장  - O
  ex)
  localStorage.setItem(
    "cart",
    JSON.stringify({
      "628e2a8166e81876191a9dd9": {
        _id: "628e2a8166e81876191a9dd9",
        quantity: 1,
        isSelected: true,
      },
    })
  );

  2) 이미 장바구니에 존재할 시 alert - O

2. 구매하기 버튼 클릭 시
  1) Order 페이지로 라우팅 - O
 */

document.body.insertAdjacentElement("afterbegin", header);
const addToCartButton = document.getElementById("addToCartButton"); // 장바구니 추가 버튼

const url = new URL(location.href);
const productId = url.searchParams.get("id"); // 현재 상품의 아이디

const paintProduct = (product) => {
  const productImageTag = document.getElementById("productImageTag");
  const manufacturerTag = document.getElementById("manufacturerTag");
  const titleTag = document.getElementById("titleTag");
  const priceTag = document.getElementById("priceTag");
  const detailDescriptionTag = document.getElementById("detailDescriptionTag");

  productImageTag.src = product.img;
  manufacturerTag.innerText = product.brandName;
  titleTag.innerText = product.name;
  priceTag.innerText = `${Number(product.price).toLocaleString()}원`;
  detailDescriptionTag.innerText = product.detailDescription;
};

const handleAddCart = () => {
  const cartItem = JSON.parse(localStorage.getItem("cart")) || {}; // 현재 장바구니 목록

  // 장바구니에 있는지 체크
  if (cartItem[productId]) {
    alert("이미 장바구니에 추가되었습니다.");
    return;
  }

  // 장바구니에 추가
  cartItem[productId] = {
    _id: productId,
    quantity: 1,
    isSelected: true,
  };

  localStorage.setItem("cart", JSON.stringify(cartItem));
};

const getDataFromApi = async () => {
  const product = await Api.get("/api/product", productId);
  paintProduct(product);
};

addToCartButton.addEventListener("click", handleAddCart);

getDataFromApi();
