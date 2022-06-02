import { userModel, orderModel, productModel } from "../db";

import bcrypt from "bcrypt";

class AdminService {
  // 본 파일의 맨 아래에서, new UserService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor(userModel, orderModel, productModel) {
    this.userModel = userModel;
    this.orderModel = orderModel;
    this.productModel = productModel;
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
    const updateOrderList = await this.orderModel.findById(orderId);
    const newUpdate = await updateOrderList.orderList.map((e) => {
      if (e.productId === productId) {
        e.status = status;
      }
      return e;
    });

    const update = { $set: { orderList: newUpdate } };
    return await this.orderModel.update({ orderId, update });
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

  exceptPwd(object) {
    const { password, ...otherKeys } = object;
    return otherKeys;
  }

  async setProduct(productId, toUpdate) {
    //우선 해당 id의 상품이 db에 있는지 확인
    let product = await this.productModel.findById(productId);

    //db에서 찾지 못한 경우, 에러 메시지 반환
    if (!product) {
      throw new Error("상품 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    //업데이트 진행
    return await this.productModel.update({
      productId,
      update: toUpdate,
    });
  }

  async deleteProduct(productIdArray) {
    let product = await productIdArray.map((productId) =>
      this.productModel.deleteById({ productId })
    );
    return product;
  }

  async addProduct(productInfo) {
    // 객체 destructuring
    const {
      name,
      price,
      category,
      quantity,
      img,
      brandName,
      keyword,
      shortDescription,
      detailDescription,
      userId,
    } = productInfo;
    if (!name || !price || !category || !quantity || !img || !shortDescription || !detailDescription || !userId) {
      throw new Error("상품 정보를 모두 입력해주세요.")
    }
    // 상품명 중복 확인
    const user = await this.productModel.findByName(name);
    if (user) {
      throw new Error(
        "이 상품명은 현재 사용중입니다. 다른 상품명을 입력해 주세요."
      );
    }
    const newProductInfo = {
      name,
      price,
      category,
      quantity,
      img,
      brandName,
      keyword,
      shortDescription,
      detailDescription,
      userId,
    };
    // 상품명 중복은 이제 아니므로, 상품 등록을 진행함
    return await this.productModel.create(newProductInfo);
  }
}

export const adminService = new AdminService(
  userModel,
  orderModel,
  productModel
);
