import { orderModel } from "../db";
class OrderService {
  constructor(orderModel) {
    this.orderModel = orderModel;
  }
  // 주문 목록 전체를 받음.
  async getOrdersAll() {
    return await this.orderModel.findByUserId();
  }

  
  // 개인의 주문 목록 조회
  async getOrders(userId) {
    return await this.orderModel.findByUserId(userId);
  }

  // 오더 id로 주문 조회
  async getOrdersByOrderId(orderId) {
    return await this.orderModel.findById(orderId);
  }

  // 주문하기
  async addOrder(orderInfo) {
    // 객체 destructuring, address는 타입 객체, orderList는 타입 배열
    const { userId, address, request, orderList, totalPrice, shippingFee } =
      orderInfo;
    // body 데이터 검증
    if (!userId || !address || !orderList || !totalPrice) {
      throw new Error("주문 정보를 올바르게 입력해주세요.")
    }
    const newOrderInfo = {
      userId,
      address,
      request,
      orderList,
      totalPrice,
      shippingFee,
    };

    // db에 주문 정보 저장
    const createdNewOrder = await this.orderModel.create(newOrderInfo);
    return createdNewOrder;
  }

  // 주문 취소 list 얻기
  async getOrdersForDelete(orderIdList) {
    const orderList = [];
    // db에서 삭제할 주문 정보 가져오기
    for (const orderId of orderIdList) {
      const order = await this.orderModel.findById(orderId);
      orderList.push(order);
    }
    return orderList;
  }

  // 주문 취소
  async deleteOrder(orderIdArray) {
    return await orderIdArray.map((orderId) =>
      this.orderModel.deleteById(orderId)
    );
  }

  async deleteOrderProduct({ orderId, productId, userId }) {
    const orderInfo = await this.getOrdersByOrderId(orderId);
    // 자신의 주문만 취소 가능
    if (userId !== orderInfo.userId) {
      throw new Error("Forbbiden");
    }
    // 주문 취소 정보 가져오기
    const deleteOrderInfo = await this.orderModel.findById(orderId);
    if (!deleteOrderInfo) {
      throw new Error("요청된 주문이 없습니다.");
    }
    // 주문 개별 취소 작업
    const newDelete = await deleteOrderInfo.orderList.filter(
      (e) => e.productId !== productId
    );
    const deleteUpdate = { $set: { orderList: newDelete } };
    // 취소된 주문을 반영하여 주문 정보 업데이트
    const newOrder = await this.orderModel.update({
      orderId,
      update: deleteUpdate,
    });
    if (!newOrder) {
      throw new Error("주문이 정상적으로 취소되지 않았습니다.");
    }
    // 주문정보에 주문 상품이 없으면 주문 정보 삭제
    if (newOrder.orderList.length < 1) {
      return await this.orderModel.deleteById(orderId);
    }
    return newOrder;
  }
}

export const orderService = new OrderService(orderModel);
