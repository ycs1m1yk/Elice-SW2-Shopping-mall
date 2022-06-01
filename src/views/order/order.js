import * as Api from "/api.js";
import { addCommas } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

//TODO
/**
 * - [] 바로 구매 (제품 상세페이지에서 cart, order 추가)
 * -----------------------------------------------------------
 * - [] 배송지 선택 UI 추가 (기본 배송지 / 자택 / 직장 / ...)
 * - [] 배송지 목록 GET API 연결
 * - [] 배송지 추가 버튼 UI + 핸들러 + 배송지 목록에 POST
 * -----------------------------------------------------------
 */

// 주문 form
const receiverNameInput = document.querySelector("#receiverName");
const receiverPhoneNumberInput = document.querySelector("#receiverPhoneNumber");
const postalCodeInput = document.querySelector("#postalCode");
const address1Input = document.querySelector("#address1");
const address2Input = document.querySelector("#address2");
const requestSelectBox = document.querySelector("#requestSelectBox");
const customRequestContainer = document.querySelector(
  "#customRequestContainer"
);
const orderForm = document.querySelector("#order-form");
const searchAddressButton = document.querySelector("#searchAddressButton");

// 결제정보
const productsTitle = document.querySelector("#productsTitle");
const productsTotal = document.querySelector("#productsTotal");
const deliveryFee = document.querySelector("#deliveryFee");
const orderTotal = document.querySelector("#orderTotal");

const handleSearch = (e) => {
  e.preventDefault();

  // eslint-disable-next-line no-undef
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = "";
      let extraAddr = "";

      if (data.userSelectedType === "R") {
        // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else {
        // 사용자가 지번 주소를 선택했을 경우(J)
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
      }

      postalCodeInput.value = data.zonecode;
      address1Input.value = `${addr} ${extraAddr}`;

      address2Input.focus();
    },
  }).open();
};

const handleSelection = () => {
  const isCustomRequest = requestSelectBox.value === "6";
  customRequestContainer.style.display = isCustomRequest ? "flex" : "none";
};

const handleSubmit = (e) => {
  e.preventDefault();

  postOrder();
  updateOrderData();
  updateCartData();

  alert("결제 및 주문이 정상적으로 완료되었습니다.\n감사합니다.");
  location.href = "./complete";
};

const postOrder = async () => {
  const requestOptions = [
    "요청사항 없음",
    "직접 수령하겠습니다.",
    "배송 전 연락바랍니다.",
    "부재 시 경비실에 맡겨주세요.",
    "부재 시 문 앞에 놓아주세요.",
    "부재 시 택배함에 넣어주세요.",
    "",
  ];
  const formData = new FormData(orderForm);
  let orderData = [...formData.entries()].reduce((acc, [k, v]) => {
    acc[k] = v;
    if (k === "request") {
      acc[k] = requestOptions[v];
    }
    if (k === "customRequest" && v) {
      acc["request"] = v;
    }

    return acc;
  }, {});

  const cart = JSON.parse(localStorage.getItem("cart"));
  const { productsTotal, selectedIds } = JSON.parse(
    localStorage.getItem("order")
  );
  const orderList = selectedIds.reduce((acc, id) => {
    const { name, price, quantity } = cart[id];
    const title = `${name} / ${quantity}개`;
    acc[id] = {
      productId: id,
      title,
      quantity,
      price,
      status: "상품 준비중",
    };

    return acc;
  }, {});

  //TODO
  // - [] 배송비 정책 반영 (현재는 하드코딩)
  orderData = {
    ...orderData,
    orderList,
    totalPrice: productsTotal,
    shippingFee: 3000,
  };

  await Api.post("/api/order/complete", orderData);
};

const updateOrderData = () => {
  const order = JSON.parse(localStorage.getItem("order"));
  const { ids, selectedIds } = order;
  const newIds = ids.filter((id) => !selectedIds.includes(id));
  const newOrder = {
    ids: newIds,
    productsCount: 0,
    productsTitles: [],
    productsTotal: 0,
    selectedIds: [],
  };

  localStorage.setItem("order", JSON.stringify(newOrder));
};

const updateCartData = () => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const remainIds = JSON.parse(localStorage.getItem("order")).ids;
  Object.keys(cart)
    .filter((id) => !remainIds.includes(id))
    .forEach((id) => delete cart[id]);

  localStorage.removeItem("cart");
  localStorage.setItem("cart", JSON.stringify(cart));
};

const addAllElements = () => {
  paintForm();
  paintOrderInfo();
};

const paintForm = async () => {
  const user = await Api.get("/api/my");
  const { fullName, phoneNumber = "", address = {} } = user;
  const { postalCode = "", address1 = "", address2 = "" } = address;

  receiverNameInput.value = fullName;
  receiverPhoneNumberInput.value = phoneNumber;
  postalCodeInput.value = postalCode;
  address1Input.value = address1;
  address2Input.value = address2;
};

const paintOrderInfo = () => {
  const order = JSON.parse(localStorage.getItem("order"));

  const fee = 3000;
  const title = order.productsTitles.join("<br>");
  productsTitle.innerHTML = title;
  productsTotal.textContent = addCommas(order.productsTotal) + "원";
  deliveryFee.textContent = addCommas(fee) + "원";
  orderTotal.textContent = addCommas(order.productsTotal + fee) + "원";
};

const addAllEvents = () => {
  searchAddressButton.addEventListener("click", handleSearch);
  requestSelectBox.addEventListener("change", handleSelection);
  orderForm.addEventListener("submit", handleSubmit);
};

addAllElements();
addAllEvents();
