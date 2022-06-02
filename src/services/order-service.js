import { orderModel } from "../db";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const checkNewOrder = await this.orderModel.findById({
      _id: createdNewOrder._id,
    });
    if (createdNewOrder.id !== checkNewOrder.id) {
      throw new Error("주문이 정상적으로 완료되지 않았습니다.");
    }
    return createdNewOrder;
  }

  // 개인의 주문 목록을 받음.
  async getOrders(userId) {
    return await this.orderModel.findByUserId(userId);
  }

  async getOrdersByOrderId(orderId) {
    return await this.orderModel.findById(orderId);
  }

  async getOrdersForDelete(orderIdList) {
    const orderList = [];
    for await (const orderId of orderIdList) {
      const order = await this.orderModel.findById(orderId);
      orderList.push(order);
    }
    return orderList;
  }

  // 주문 목록 전체를 받음.
  async getOrdersAll() {
    return await this.orderModel.findByUserId();
  }

  // 주문 취소
  async deleteOrder(orderIdArray) {
    return await orderIdArray.map((orderId) =>
      this.orderModel.deleteById(orderId)
    );
  }

  async deleteProduct({ orderId, productId }) {
    const deleteOrderList = await this.orderModel.findById(orderId);
    const newDelete = await deleteOrderList.orderList.filter(
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

    return await newOrder;
  }
}

export const orderService = new OrderService(orderModel);
