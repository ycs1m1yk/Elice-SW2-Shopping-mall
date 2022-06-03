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

const addToCartButton = document.getElementById("addToCartButton");
const purchaseButton = document.getElementById("purchaseButton");

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
    alert("이미 장바구니에 추가되어 있습니다.");
    return;
  }

  // 장바구니에 추가
  cartItem[productId] = {
    _id: productId,
    quantity: 1,
    isSelected: true,
  };

  localStorage.setItem("cart", JSON.stringify(cartItem));
  alert("장바구니에 추가되었습니다.");
};

const handlePurchase = async () => {
  const cartItem = JSON.parse(localStorage.getItem("cart")) || {};

  // 장바구니에 있는지 체크
  if (cartItem[productId]) {
    alert("이미 장바구니에 있는 상품입니다.");
    return;
  }

  // 장바구니에 추가
  cartItem[productId] = {
    _id: productId,
    quantity: 1,
    isSelected: true,
  };

  let orderItem = JSON.parse(localStorage.getItem("order")) || {};
  const product = await Api.get("/api/product", productId);
  if (Object.prototype.hasOwnProperty.call(orderItem, "ids")) {
    orderItem.ids.push(productId);
    orderItem.productsCount += 1;
    orderItem.productsTitles.push(`${product.name} / 1개`);
    orderItem.productsTotal += product.price;
    orderItem.selectedIds.push(productId);
  } else {
    orderItem = {
      ids: [productId],
      productsCount: 1,
      productsTitles: [`${product.name} / 1개`],
      productsTotal: product.price,
      selectedIds: [productId],
    };
  }

  localStorage.setItem("cart", JSON.stringify(cartItem));
  localStorage.setItem("order", JSON.stringify(orderItem));

  location.href = "/order";
};

const getDataFromApi = async () => {
  const product = await Api.get("/api/product", productId);
  paintProduct(product);
};

addToCartButton.addEventListener("click", handleAddCart);
purchaseButton.addEventListener("click", handlePurchase);

getDataFromApi();
