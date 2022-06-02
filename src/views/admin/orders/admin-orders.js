import * as Api from "/api.js";
import { addCommas } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

const ordersContainer = document.querySelector("#ordersContainer");
const modal = document.querySelector("#modal");

const handleChange = async (e) => {
  const target = e.target;
  const { action } = target.dataset;
  if (action === "select") {
    const options = target.options;
    const selectedIndex = options.selectedIndex;
    const classList = [...options[selectedIndex].classList];
    target.classList = [];
    classList.forEach((className) => target.classList.add(className));

    const status = options[selectedIndex].text;
    const columns = target.closest(".columns");
    const { orderId, productId } = columns.dataset;
    await Api.put(`/api/admin/order/${orderId}/${productId}`, {
      status,
    });
  }
};

const handleClick = (e) => {
  const target = e.target;
  const { action } = target.dataset;
  if (action === "cancel") {
    const columns = target.closest(".columns");
    const { orderId, productId } = columns.dataset;

    modal.classList.toggle("is-active");
    modal.dataset.targetOrderId = orderId;
    modal.dataset.targetProductId = productId;
  }
};

const handleConfirm = async (e) => {
  e.preventDefault();

  const { action } = e.target.dataset;
  if (action === "delete") {
    const { targetOrderId: orderId, targetProductId: productId } =
      modal.dataset;
    await Api.delete("/api/admin/order/delete", "", {
      orderId,
      productId,
    });

    const targetColumnsElem = document.querySelector(
      `.columns[data-order-id="${orderId}"][data-product-id="${productId}"]`
    );
    targetColumnsElem.remove();
  }

  modal.classList.toggle("is-active");
};

const addAllElements = async () => {
  const orders = await Api.get("/api/admin/orders");
  paintNav(orders);
  await paintOrders(orders);
  updateOptionByStatus();
};

const paintNav = (orders) => {
  const entireStatusList = orders
    .reduce((result, order) => {
      const { orderList } = order;
      const subList = orderList.reduce((subResult, subOrder) => {
        subResult.push(subOrder.status);

        return subResult;
      }, []);

      result.push(subList);

      return result;
    }, [])
    .flat();

  const ordersCount = entireStatusList.length;
  const prepareCount = entireStatusList.filter(
    (el) => el === "상품 준비중"
  ).length;
  const deliveryCount = entireStatusList.filter(
    (el) => el === "상품 배송중"
  ).length;
  const completeCount = ordersCount - prepareCount - deliveryCount;
  const counts = {
    ordersCount,
    prepareCount,
    deliveryCount,
    completeCount,
  };

  [...document.querySelectorAll(".level-item p.title")].forEach((el) => {
    el.textContent = counts[el.id];
  });
};

const paintOrders = async (orders) => {
  const orderInfos = [];

  for (const { _id, orderList, updatedAt } of orders) {
    const date = updatedAt.slice(0, 10);
    for await (const { productId, quantity, status } of orderList) {
      const product = await Api.get("/api/product", productId);
      const { img, price, name, brandName } = product;
      const orderInfo = {
        _id,
        productId,
        img,
        name,
        brandName,
        date,
        price,
        quantity,
        status,
      };
      orderInfos.push(orderInfo);
    }
  }

  const docFragment = document.createDocumentFragment();
  orderInfos.forEach((orderInfo) => {
    const html = makeOrderItem(orderInfo);
    docFragment.append(
      ...new DOMParser().parseFromString(html, "text/html").body.childNodes
    );
  });

  ordersContainer.appendChild(docFragment);
};

const makeOrderItem = ({
  _id,
  productId,
  img,
  name,
  brandName,
  date,
  price,
  quantity,
  status,
}) => {
  const priceNumber = addCommas(Number(price));
  const quantityNumber = Number(quantity);

  return `
    <div class="columns orders-item" data-order-id="${_id}" data-product-id="${productId}" data-status="${status}">
      <div class="column is-4 product-item">
        <figure class="image is-64x64 product-img">
          <img
            src=${img}
            alt="product-image"
          />
        </figure>
        <p class="product-info">${brandName} - ${name}</p>
      </div>
      <div class="column is-2 order-date">
        <p>${date}</p>
      </div>
      <div class="column is-2 order-info">
        <p>${priceNumber}원 / ${quantityNumber}개</p>
      </div>
      <div class="column is-2">
        <div class="select">
          <select class="has-background-danger-light has-text-danger" data-action="select">
            <option class="has-background-danger-light has-text-danger" selected="" value="상품 준비중">
              상품 준비중
            </option>
            <option class="has-background-primary-light has-text-primary" value="상품 배송중">
              상품 배송중
            </option>
            <option class="has-background-grey-light" value="배송완료">
              배송완료
            </option>
          </select>
        </div>
      </div>
      <div class="column is-2 order-cancel">
        <button class="button delete-button" data-action="cancel">주문 취소</button>
      </div>
    </div>
  `;
};

const updateOptionByStatus = () => {
  const statusTexts = ["상품 준비중", "상품 배송중", "배송완료"];
  const selectBoxes = [...document.querySelectorAll(".columns select")];

  selectBoxes.forEach((el) => {
    const { status } = el.closest(".columns").dataset;
    const index = statusTexts.indexOf(status);
    const options = el.options;
    options[index].setAttribute("selected", "");

    const classList = [...options[index].classList];
    el.classList = [];
    classList.forEach((className) => el.classList.add(className));

    // 배송이 완료된 상품은 상태변경 불가, 완료버튼 표시
    if (status === "배송완료") {
      el.setAttribute("disabled", "");

      const targetButton =
        el.parentElement.parentElement.nextElementSibling.firstElementChild;
      targetButton.textContent = "완료";
    }
  });
};

const addAllEvents = () => {
  ordersContainer.addEventListener("change", handleChange);
  ordersContainer.addEventListener("click", handleClick);
  modal.addEventListener("click", handleConfirm);
};

addAllElements();
addAllEvents();
