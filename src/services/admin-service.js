import { userModel, orderModel } from "../db";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AdminService {
  // 본 파일의 맨 아래에서, new UserService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor(userModel, orderModel) {
    this.userModel = userModel;
    this.orderModel = orderModel;
  }

  // 사용자 목록을 받음.
  async getUsers() {
    return await this.userModel.findAll();
  }

  async deleteUser(userInfoRequired) {
    const { email } = userInfoRequired;
    return await this.userModel.deleteByEmail(email);
  }

  async getOrders() {
    return await this.orderModel.findAll();
  }

  async setOrderStatus(orderInfoRequired, toUpdate) {
    const { orderId, productId } = orderInfoRequired;
    const { status } = toUpdate;
    const findCondition = { orderId, "orderList.productId": productId };
    const update = {
      $set: {
        "orderList.$.status": status,
      },
    };
    // Order.findOneAndUpdate(
    //   { orderId, "orderList.productId": productId },
    //   {
    //     $set: {
    //       "orderList.$.status": status,
    //     },
    //   }
    // );
    return await this.orderModel.update({ findCondition, update });
  }

  async deleteOrder(orderInfoRequired) {
    const { orderId } = orderInfoRequired;
    return await this.orderModel.deleteById(orderId);
  }

  // 관리자 계정 확인
  async adminVerify(userId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }

    const userRole = user.role;
    if (userRole !== "admin") {
      throw new Error("관리자가 아니면 접속할 수  없습니다.");
    }
  }

  async setUserRole(userInfoRequired, toUpdate) {
    const { email } = userInfoRequired;
    const userInfo = await this.userModel.findByEmail(email);
    const userId = userInfo._id;
    return await this.userModel.update({ userId, update: toUpdate });
  }

  // 비밀번호 일치 여부 확인
  async userVerify(userId, currentPassword) {
    // 우선 해당 id의 유저가 db에 있는지 확인
    let user = await this.userModel.findById(userId);
    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      throw new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }

    // 이제, 정보 수정을 위해 사용자가 입력한 비밀번호가 올바른 값인지 확인해야 함

    // 비밀번호 일치 여부 확인
    const correctPasswordHash = user.password;
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      correctPasswordHash
    );

    if (!isPasswordCorrect) {
      throw new Error(
        "현재 비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요."
      );
    }
  }
}

export const adminService = new AdminService(userModel, orderModel);
