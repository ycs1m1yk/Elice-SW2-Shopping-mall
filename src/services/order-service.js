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
    const {
      userId,
      fullName,
      phoneNumber,
      address,
      requirement,
      orderList,
      totalPrice,
    } = orderInfo;

    const newOrderInfo = {
      userId,
      fullName,
      phoneNumber,
      address,
      requirement,
      orderList,
      totalPrice,
    };

    // db에 저장
    const createdNewOrder = await this.orderModel.create(newOrderInfo);

    return createdNewOrder;
  }

  // 개인의 주문 목록을 받음.
  async getOrders(userId) {
    const order = await this.orderModel.findByUserId(userId);
    return order;
  }

  async deleteOrder(orderIdArray) {
    
    let order = orderIdArray.map(productId => await this.userModel.deleteByProductId({ productId }));
    return order;
  }
}

const orderService = new OrderService(orderModel);

export { orderService };
