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
    const checkNewOrder = await this.orderModel.findById({
      _id: createdNewOrder._id,
    });
    // db 데이터 확인
    if (createdNewOrder.id !== checkNewOrder.id) {
      throw new Error("주문이 정상적으로 완료되지 않았습니다.");
    }
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

  async deleteOrderProduct({ orderId, productId }) {
    const deleteOrderInfo = await this.orderModel.findById(orderId);
    // 주문 정보 데이터 확인
    if (!deleteOrderInfo) {
      throw new Error("요청된 주문이 없습니다.");
    }
    // 주문 list 가져오기
    const newDelete = await deleteOrderInfo.orderList.filter(
      (e) => e.productId !== productId
    );
    const deleteUpdate = { $set: { orderList: newDelete } };
    const newOrder = await this.orderModel.update({
      orderId,
      update: deleteUpdate,
    });

    if (newOrder.orderList.length < 1) {
      return await this.orderModel.deleteById(orderId);
    }

    return newOrder;
  }
}

export const orderService = new OrderService(orderModel);
