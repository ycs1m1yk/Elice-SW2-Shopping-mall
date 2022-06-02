import { orderModel } from "../db";

class OrderService {
  // 본 파일의 맨 아래에서, new OrderService(orderModel) 하면, 이 함수의 인자로 전달됨
  constructor(orderModel) {
    this.orderModel = orderModel;
  }

  // 주문하기
  async addOrder(orderInfo) {
    // 객체 destructuring, address는 타입 객체, orderList는 타입 배열
    const { userId, address, request, orderList, totalPrice, shippingFee } =
      orderInfo;
    if (!userId || !address || !orderList || !totalPrice) {
      throw new Error("모든 정보를 입력해 주세요.");
    }
    const newOrderInfo = {
      userId,
      address,
      request,
      orderList,
      totalPrice,
      shippingFee,
    };

    // db에 저장
    const createdNewOrder = await this.orderModel.create(newOrderInfo);
    if (!createdNewOrder) {
      throw new Error("주문이 정상적으로 완료되지 않았습니다.");
    }
    return createdNewOrder;
  }

  // 개인의 주문 목록을 받음.
  async getOrders(userId) {
    const orders = await this.orderModel.findByUserId(userId);
    if (!orders) {
      throw new Error("주문 목록을 불러올 수 없습니다.");
    }
    return orders;
  }

  async getOrdersByOrderId(orderId) {
    const orders = await this.orderModel.findById(orderId);
    if (!orders) {
      throw new Error("주문 목록을 불러올 수 없습니다.");
    }
    return orders;
  }

  async deleteProduct({ orderId, productId, userId }) {
    const orderInfo = await this.getOrdersByOrderId(orderId);
    if (userId !== orderInfo.userId) {
      throw new Error("Forbidden");
    }

    const deleteOrderList = await this.orderModel.findById(orderId);
    const newDelete = await deleteOrderList.orderList.filter(
      (e) => e.productId !== productId
    );
    const deleteUpdate = { $set: { orderList: newDelete } };
    const newOrder = await this.orderModel.update({
      orderId,
      update: deleteUpdate,
    });

    if (!newOrder) {
      throw new Error("주문 상품을 삭제하지 못했습니다.");
    }

    if (newOrder.orderList.length < 1) {
      const deletedOrder = await this.orderModel.deleteById(orderId);
      if (!deletedOrder) {
        throw new Error("주문 정보를 삭제하지 못했습니다.");
      }
      return deletedOrder;
    }

    return newOrder;
  }
}

export const orderService = new OrderService(orderModel);
