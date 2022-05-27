import * as Api from "/api.js";
import header from "/components/Header.js";

/**
TODO

1. 장바구니 추가 버튼 누를 시 
  1)LocalStorage 저장 
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

  2) 이미 장바구니에 존재할 시 alert

2. 구매하기 버튼 클릭 시
  1) Order 페이지로 라우팅


 */

document.body.insertAdjacentElement("afterbegin", header);
const addToCartButton = document.getElementById("addToCartButton"); // 장바구니 추가 버튼
const purchaseButton = document.getElementById("purchaseButton"); // 구매하기 버튼

const paintProduct = (product) => {
  const productImageTag = document.getElementById("productImageTag");
  const manufacturerTag = document.getElementById("manufacturerTag");
  const titleTag = document.getElementById("titleTag");
  const priceTag = document.getElementById("priceTag");
  const detailDescriptionTag = document.getElementById("detailDescriptionTag");

  productImageTag.src = product.img;
  manufacturerTag.innerText = product.brandName;
  titleTag.innerText = product.name;
  priceTag.innerText = product.price;
  detailDescriptionTag.innerText = product.detailDescription;
};

const getDataFromApi = async () => {
  const url = new URL(location.href);
  const productId = url.searchParams.get("id");

  const product = await Api.get("/api/product", productId);
  paintProduct(product);
};

const handleAddCart = (e) => {
  console.log("장바구니 추가");
  console.log(e);
};

const handlePurchase = (e) => {
  console.log("구매하기");
  console.log(e);
};

addToCartButton.addEventListener("click", handleAddCart);
purchaseButton.addEventListener("click", handlePurchase);

getDataFromApi();
