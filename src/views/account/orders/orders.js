import * as Api from "/api.js";
import { addCommas } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

//TODO
/**
 * - [] paint 주문정보
 *  ㄴ [x] GET /api/order/orderList
 *  ㄴ [x] makeOrderItem
 *  ㄴ [] Document.createDocumentFragment() 사용하기
 * - [x] 모달창
 * - [x] 주문취소
 *  ㄴ [x] DELETE /api/order/delete
 * - [x] 후기작성 redirect
 */
const ordersContainer = document.querySelector("#ordersContainer");
const modal = document.querySelector("#modal");

const paintOrders = async () => {
  const orders = await Api.get("/api/order/orderList");
  const orderInfos = [];

  for (const { _id, orderList, updatedAt } of orders) {
    const date = updatedAt.slice(0, 10);
    for await (const { productId, price, quantity, status } of orderList) {
      const product = await Api.get("/api/product", productId);
      const { img, name, brandName } = product;
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

  orderInfos.forEach((orderInfo) => {
    const orderItem = makeOrderItem(orderInfo);
    ordersContainer.insertAdjacentHTML("beforeend", orderItem);
  });
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
  const isDelivered = status === "배송완료";
  const cacelButtonDisplay = isDelivered ? "display:none" : "display:flex";
  const reviewButtonDisplay = isDelivered ? "display:flex" : "display:none";

  return `
    <div class="columns orders-item" data-order-id="${_id}" data-product-id="${productId}">
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
      <div class="column is-3 order-info">
        <p>${priceNumber}원 / ${quantityNumber}개</p>
      </div>
      <div class="column is-3">
        <p class="order-status">${status}</p>
        <button class="button delete-button" data-action="cancel" style=${cacelButtonDisplay}>주문 취소</button>
        <a href="/path/to/review/write" class="button is-info review-button" style=${reviewButtonDisplay}>후기 작성</a>
      </div>
    </div>
  `;
};

const handleClick = (e) => {
  const action = e.target.dataset.action;
  if (action === "cancel") {
    const columns = e.target.closest(".columns");
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
    await Api.delete("/api/order/delete", "", {
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

paintOrders();
ordersContainer.addEventListener("click", handleClick);
modal.addEventListener("click", handleConfirm);
