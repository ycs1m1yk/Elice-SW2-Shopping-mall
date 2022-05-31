import * as Api from "/api.js";
import { addCommas } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

// 요소(element), input 혹은 상수
const cartProductsContainer = document.querySelector("#cartProductsContainer");
const allSelectCheckbox = document.querySelector("#allSelectCheckbox");
const partialDeleteLabel = document.querySelector("#partialDeleteLabel");
const productsCount = document.querySelector("#productsCount");
const productsTotal = document.querySelector("#productsTotal");
const deliveryFee = document.querySelector("#deliveryFee");
const orderTotal = document.querySelector("#orderTotal");
const purchaseButton = document.querySelector("#purchaseButton");

// static nodes 이벤트핸들러
const handleAllSelectCheckboxChange = (e) => {
  const isChecked = e.currentTarget.checked;
  const productCheckBoxes = document.querySelectorAll("[id^='checkbox-']");

  productCheckBoxes.forEach((el) => {
    el.checked = isChecked;
    el.dispatchEvent(new Event("change"));
  });
};

const handlePartialDeleteLabelClick = () => {
  const productCheckBoxesChecked = document.querySelectorAll(
    "[id^='checkbox-']:checked"
  );
  productCheckBoxesChecked.forEach((el) => {
    const productId = el.id.split("-")[1];
    const deleteButton = document.querySelector("#delete-".concat(productId));

    deleteButton.dispatchEvent(new Event("click"));
  });
};

const handlePurchase = () => {
  const isEmptyOrder =
    JSON.parse(localStorage.getItem("order")).selectedIds.length === 0;
  if (isEmptyOrder) {
    alert("구매할 제품이 없습니다. 장바구니에서 선택해 주세요.");
    return;
  }
  location.href = "../order";
};

// live nodes 이벤트핸들러
const handleDeleteClick = (e, id) => {
  const productContainer = e.currentTarget.parentNode;
  productContainer.remove();
  removeProductById(id);
};

const handleCheckboxChange = (e, id) => {
  const isChecked = e.currentTarget.checked;
  updatedProductById(id, { isSelected: isChecked });
  updateAllSelectCheckbox();
  disableControlById(id);
};

const handleImageClick = (e, id) => {
  location.href = `../product/detail/?id=${id}`;
};

const handleTitleClick = (e, id) => {
  location.href = `../product/detail/?id=${id}`;
};

const handlePlusClick = (e, id) => {
  const quantityInput = document.querySelector(`#quantityInput-${id}`);
  quantityInput.stepUp();

  const quantity = Number(quantityInput.value);
  updatedProductById(id, { quantity });
  disableControlById(id);
};

const handleMinusClick = (e, id) => {
  const quantityInput = document.querySelector(`#quantityInput-${id}`);
  quantityInput.stepDown();

  const quantity = Number(quantityInput.value);
  updatedProductById(id, { quantity });
  disableControlById(id);
};

const handleQuantityInputChange = (e, id) => {
  let quantity = Number(e.currentTarget.value);
  const inputMin = Number(e.currentTarget.min);
  const inputMax = Number(e.currentTarget.max);
  if (quantity < inputMin || quantity > inputMax) {
    alert("상품은 1~99 범위에서 구매 가능합니다.");

    if (quantity >= inputMax) {
      e.currentTarget.value = inputMax;
    } else {
      e.currentTarget.value = inputMin;
    }
  }
  quantity = Number(e.currentTarget.value);
  updatedProductById(id, { quantity });
  disableControlById(id);
};

// callee 함수들
const updateAllSelectCheckbox = () => {
  const order = JSON.parse(localStorage.getItem("order"));
  const isAllSelected = order.ids.length === order.selectedIds.length;
  allSelectCheckbox.checked = isAllSelected;
};

const disableControlById = (id) => {
  const minusButton = document.querySelector(`#minus-${id}`);
  const plusButton = document.querySelector(`#plus-${id}`);
  const quantityInput = document.querySelector(`#quantityInput-${id}`);

  const isChecked = document.querySelector(`#checkbox-${id}`).checked;
  const quantity = Number(quantityInput.value);
  const minQuantity = Number(quantityInput.min);
  const maxQuantity = Number(quantityInput.max);

  if (isChecked) {
    minusButton.disabled = quantity <= minQuantity ? true : false;
    plusButton.disabled = quantity >= maxQuantity ? true : false;
    quantityInput.disabled = false;
    return;
  }
  minusButton.disabled = true;
  plusButton.disabled = true;
  quantityInput.disabled = true;
};

const removeProductById = (id) => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  delete cart[id];
  localStorage.setItem("cart", JSON.stringify(cart));

  updateOrderData();
  updateOrderInfo();
};

const updatedProductById = (id, newProductInfo) => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  Object.entries(newProductInfo).forEach(([k, v]) => {
    cart[id][k] = v;
  });
  localStorage.setItem("cart", JSON.stringify(cart));

  updateProductInfoById(id);
  updateOrderData();
  updateOrderInfo();
};

const updateProductInfoById = (id) => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const foundProduct = cart[id];
  const price = foundProduct.price;
  const quantity = foundProduct.quantity;
  const total = addCommas(price * quantity);
  document.querySelector(`#quantity-${id}`).textContent = `${quantity}개`;
  document.querySelector(`#total-${id}`).textContent = `${total}원`;
};

// html에 요소를 추가하는 함수들을 묶어주어서 코드를 깔끔하게 하는 역할임.
const addAllElements = () => {
  paintCartProducts();
};

const paintCartProducts = async () => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const cartValues = Object.values(cart);
  const products = [];

  for await (const { _id, quantity } of cartValues) {
    const data = await Api.get("/api/product", _id.trim());
    const product = {
      _id,
      name: data.name,
      price: data.price,
      quantity,
      img: data.img,
    };
    products.push(product);

    cart[_id].name = data.name;
    cart[_id].price = data.price;
  }

  // update localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  updateOrderData();
  updateOrderInfo();

  products.forEach((product) => {
    const productElem = makeProductItem(product);
    cartProductsContainer.insertAdjacentHTML("beforeend", productElem);

    const id = product._id;
    document
      .querySelector(`#delete-${id}`)
      .addEventListener("click", (e) => handleDeleteClick(e, id));
    document
      .querySelector(`#checkbox-${id}`)
      .addEventListener("change", (e) => handleCheckboxChange(e, id));
    document
      .querySelector(`#image-${id}`)
      .addEventListener("click", (e) => handleImageClick(e, id));
    document
      .querySelector(`#title-${id}`)
      .addEventListener("click", (e) => handleTitleClick(e, id));
    document
      .querySelector(`#plus-${id}`)
      .addEventListener("click", (e) => handlePlusClick(e, id));
    document
      .querySelector(`#minus-${id}`)
      .addEventListener("click", (e) => handleMinusClick(e, id));
    document
      .querySelector(`#quantityInput-${id}`)
      .addEventListener("change", (e) => handleQuantityInputChange(e, id));
  });
};

const makeProductItem = ({ _id, name, price, quantity, img }) => {
  const priceNumber = Number(price);
  const quantityNumber = Number(quantity);
  const totalPrice = priceNumber * quantityNumber;

  return `
    <div
      class="cart-product-item"
      id="productItem-${_id}"
    >
      <label class="checkbox">
        <input
          type="checkbox"
          id="checkbox-${_id}"
          checked=""
        />
      </label>
      <button
        class="delete-button"
        id="delete-${_id}"
      >
        <span class="icon">
          <i class="fas fa-trash-can" aria-hidden="true"></i>
        </span>
      </button>
      <figure class="image is-96x96">
        <img
          id="image-${_id}"
          src=${img}
          alt="product-image"
        />
      </figure>
      <div class="content">
        <p id="title-${_id}">${name}</p>
        <div class="quantity">
          <button
            class="button is-rounded"
            id="minus-${_id}"
            disabled=""
          >
            <span class="icon is-small">
              <i class="fas fa-thin fa-minus" aria-hidden="true"></i>
            </span>
          </button>
          <input
            class="input"
            id="quantityInput-${_id}"
            type="number"
            min="1"
            max="99"
            value="${quantity}"
          />
          <button
            class="button is-rounded"
            id="plus-${_id}"
          >
            <span class="icon">
              <i class="fas fa-lg fa-plus" aria-hidden="true"></i>
            </span>
          </button>
        </div>
      </div>
      <div class="calculation">
        <p id="unitPrice-${_id}">${addCommas(priceNumber)}원</p>
        <p>
          <span class="icon">
            <i class="fas fa-thin fa-xmark" aria-hidden="true"></i>
          </span>
        </p>
        <p id="quantity-${_id}">${quantityNumber}개</p>
        <p>
          <span class="icon">
            <i class="fas fa-thin fa-equals" aria-hidden="true"></i>
          </span>
        </p>
        <p id="total-${_id}">${addCommas(totalPrice)}원</p>
      </div>
    </div>
    `;
};

const updateOrderData = () => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const ids = Object.keys(cart);
  const {
    i: selectedIds,
    c: productsCount,
    titles: productsTitles,
    t: productsTotal,
  } = Object.values(cart).reduce(
    (acc, curr) => {
      const { _id, name, quantity, isSelected, price } = curr;
      if (isSelected) {
        acc.i.push(_id);
        acc.c += quantity;
        acc.titles.push(`${name} / ${quantity}개`);
        acc.t += price * quantity;
      }
      return acc;
    },
    { i: [], c: 0, titles: [], t: 0 }
  );

  localStorage.setItem(
    "order",
    JSON.stringify({
      ids,
      productsCount,
      productsTitles,
      productsTotal,
      selectedIds,
    })
  );
};

const updateOrderInfo = () => {
  const order = JSON.parse(localStorage.getItem("order"));

  const isEmptyOrder = order.selectedIds.length === 0;
  const fee = isEmptyOrder ? 0 : 3000;
  productsCount.textContent = addCommas(order.productsCount) + "개";
  productsTotal.textContent = addCommas(order.productsTotal) + "원";
  deliveryFee.textContent = addCommas(fee) + "원";
  orderTotal.textContent = addCommas(order.productsTotal + fee) + "원";
};

const addAllEvents = () => {
  allSelectCheckbox.addEventListener("change", handleAllSelectCheckboxChange);
  partialDeleteLabel.addEventListener("click", handlePartialDeleteLabelClick);
  purchaseButton.addEventListener("click", handlePurchase);
};

addAllElements();
addAllEvents();
