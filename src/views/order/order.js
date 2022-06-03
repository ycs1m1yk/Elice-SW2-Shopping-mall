import * as Api from "/api.js";
import { addCommas, getToken } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

// 주문 form
const orderForm = document.querySelector("#order-form");
const customAddressRadio = document.querySelector("#customAddress");
const addressSaveButton = document.querySelector("#addressSaveButton");
const addressDeleteButton = document.querySelector("#addressDeleteButton");
const receiverNameInput = document.querySelector("#receiverName");
const receiverPhoneNumberInput = document.querySelector("#receiverPhoneNumber");
const postalCodeInput = document.querySelector("#postalCode");
const address1Input = document.querySelector("#address1");
const address2Input = document.querySelector("#address2");
const customRequestContainer = document.querySelector(
  "#customRequestContainer"
);
const modal = document.querySelector("#modal");
const modal2 = document.querySelector("#modal2");

// 결제정보
const productsTitle = document.querySelector("#productsTitle");
const productsTotal = document.querySelector("#productsTotal");
const deliveryFee = document.querySelector("#deliveryFee");
const orderTotal = document.querySelector("#orderTotal");

const handleChange = (e) => {
  const target = e.target;
  const id = target.id;

  if (target.type === "radio") {
    if (id === "customAddress") {
      selectCustomAddress();
    } else {
      selectNamedAddress(target.id);
    }
  }
  if (id === "requestSelectBox") {
    const isCustomRequest = target.value === "6";
    customRequestContainer.style.display = isCustomRequest ? "flex" : "none";
  }
};

const selectCustomAddress = () => {
  [...orderForm.elements].forEach((el) => {
    el.removeAttribute("disabled");
    if (el.id !== "requestSelectBox" && el.id !== "customRequest") {
      el.value = "";
    }
  });
  addressSaveButton.classList.remove("is-hidden");
  addressDeleteButton.classList.add("is-hidden");
};

const selectNamedAddress = (addressName) => {
  const blackList = [
    "postalCode",
    "searchAddressButton",
    "address1",
    "address2",
  ];
  [...orderForm.elements].forEach((el) => {
    if (blackList.includes(el.id)) {
      el.setAttribute("disabled", "");
    }
  });

  addressSaveButton.classList.add("is-hidden");
  addressDeleteButton.classList.remove("is-hidden");
  addressDeleteButton.dataset.addressName = addressName;

  paintForm(addressName);
};

const paintForm = async (addressName) => {
  const user = await Api.get("/api/my");
  const { fullName, phoneNumber = "", address = [] } = user;
  const selectedAddress = address.find((el) => el.addressName === addressName);
  const {
    postalCode = "",
    address1 = "",
    address2 = "",
  } = selectedAddress || {};

  receiverNameInput.value = fullName;
  receiverPhoneNumberInput.value = phoneNumber;
  postalCodeInput.value = postalCode;
  address1Input.value = address1;
  address2Input.value = address2;
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

  // radio버튼값 제거
  delete orderData["address"];

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

const handleClick = async (e) => {
  const target = e.target;
  const id = target.id;
  if (id === "addressSaveButton") {
    const formData = new FormData(orderForm);

    modal.dataset.postalCode = formData.get("postalCode");
    modal.dataset.address1 = formData.get("address1");
    modal.dataset.address2 = formData.get("address2");
    modal.classList.toggle("is-active");
  }

  if (id === "addressDeleteButton") {
    const { addressName } = addressDeleteButton.dataset;
    modal2.dataset.addressName = addressName;

    modal2.classList.toggle("is-active");
  }

  if (id === "searchAddressButton") {
    handleSearch();
  }
};

const handleSearch = () => {
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

const handleSave = async (e) => {
  e.preventDefault();

  const { action } = e.target.dataset;
  if (action) {
    if (action === "submit") {
      const { postalCode, address1, address2 } = modal.dataset;
      const addressName = document.querySelector("#addressNameInput").value;
      await fetch("/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ addressName, postalCode, address1, address2 }),
      }).then((res) => {
        if (res.ok) {
          return alert("배송지가 정상적으로 저장되었습니다.");
        } else {
          return alert(
            "배송지 저장에 문제가 발생하였습니다. 다시 시도해주세요."
          );
        }
      });

      addAddressRadioElem(addressName);
    }

    modal.classList.toggle("is-active");
  }
};

const addAddressRadioElem = (addressName) => {
  const radioElem = `
    <input
      type="radio"
      name="address"
      id=${addressName}
    />
    <label class="address-choice" for=${addressName}
      >${addressName}
    </label>
  `;

  customAddressRadio.insertAdjacentHTML("beforebegin", radioElem);
  document.getElementById(addressName).setAttribute("checked", "");
  selectNamedAddress(addressName);
};

const handleDelete = async (e) => {
  e.preventDefault();

  const { action } = e.target.dataset;
  if (action) {
    if (action === "delete") {
      const { addressName } = modal2.dataset;
      await fetch("/api/address", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ addressName }),
      }).then((res) => {
        if (res.ok) {
          return alert("배송지가 삭제되었습니다.");
        } else {
          return alert(
            "배송지 삭제에 문제가 발생하였습니다. 다시 시도해주세요."
          );
        }
      });

      removeAddressRadioElem(addressName);
    }

    modal2.classList.toggle("is-active");
  }
};

const removeAddressRadioElem = (addressName) => {
  document.getElementById(addressName).remove();
  document.querySelector(`label[for=${addressName}]`).remove();

  customAddressRadio.setAttribute("checked", "");
  selectCustomAddress();
};

const addAllElements = () => {
  selectCustomAddress();
  paintOrderInfo();
  updateAddressRadioElem();
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

const updateAddressRadioElem = async () => {
  const user = await Api.get("/api/my");
  const { address = [] } = user;
  address.forEach((el) => {
    const addressName = el.addressName;
    const radioElem = `
    <input
      type="radio"
      name="address"
      id=${addressName}
    />
    <label class="address-choice" for=${addressName}
      >${addressName}
    </label>
  `;

    customAddressRadio.insertAdjacentHTML("beforebegin", radioElem);
  });
};

const addAllEvents = () => {
  orderForm.addEventListener("change", handleChange);
  orderForm.addEventListener("submit", handleSubmit);
  orderForm.addEventListener("click", handleClick);
  modal.addEventListener("click", handleSave);
  modal2.addEventListener("click", handleDelete);
};

addAllElements();
addAllEvents();
