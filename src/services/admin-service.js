import { userModel, orderModel, productModel } from "../db";

import bcrypt from "bcrypt";

class AdminService {
  // 본 파일의 맨 아래에서, new UserService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor(userModel, orderModel, productModel) {
    this.userModel = userModel;
    this.orderModel = orderModel;
    this.productModel = productModel;
  }

  // 회원 목록 조회
  async getUsers() {
    // db에서 회원 정보 조회
    const users = await this.userModel.findAll();
    if (!users) {
      throw new Error("회원 목록을 조회할 수 없습니다.");
    }
    return users;
  }

  // 주문 목록 조회
  async getOrders() {
    const orders = await this.orderModel.findAll();
    if (!orders) {
      throw new Error("주문 목록을 조회할 수 없습니다.");
    }
    return orders;
  }

  // orderId로 주문 목록 조회
  async getOrdersByOrderId(orderId) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("주문 목록을 조회할 수 없습니다.");
    }
    return order;
  }

  // 상품 추가
  async addProduct(productInfo) {
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
    if (
      !name ||
      !price ||
      !category ||
      !brandName ||
      !img ||
      !shortDescription ||
      !detailDescription ||
      !userId
    ) {
      throw new Error("상품 정보를 모두 입력해주세요.");
    }
    // 상품명 중복 확인
    const usedproduct = await this.productModel.findByName(name);
    if (usedproduct) {
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
    // 상품 등록
    const newProduct = await this.productModel.create(newProductInfo);
    if (!newProduct) {
      throw new Error("상품이 정상적으로 추가되지 않았습니다.");
    }
    return newProduct;
  }

  // 회원 권한 수정
  async setUserRole(userInfoRequired, toUpdate) {
    const { email } = userInfoRequired;
    if (!email) {
      throw new Error("회원 정보가 없습니다.");
    }
    const userInfo = await this.userModel.findByEmail(email);
    if (!userInfo) {
      throw new Error("회원 정보가 없습니다.");
    }
    const userId = userInfo._id;
    const updatedUser = await this.userModel.update({
      userId,
      update: toUpdate,
    });
    if (!updatedUser) {
      throw new Error("회원 정보가 수정되지 않았습니다.");
    }
    return updatedUser;
  }

  // 배송 상태 수정
  async setOrderStatus(orderInfoRequired, toUpdate) {
    const { orderId, productId } = orderInfoRequired;
    const { status } = toUpdate;
    if (!orderId || !productId) {
      throw new Error("주문 정보 혹은 상품 정보가 없습니다.");
    }
    if (!status) {
      throw new Error("배송 상태 정보가 없습니다.");
    }
    const updateOrderList = await this.orderModel.findById(orderId);
    if (updateOrderList) {
      throw new Error("주문 정보가 없습니다.");
    }
    const newUpdate = await updateOrderList.orderList.map((e) => {
      if (e.productId === productId) {
        e.status = status;
      }
      return e;
    });

    const update = { $set: { orderList: newUpdate } };
    const updatedOrder = await this.orderModel.update({ orderId, update });
    if (!updatedOrder) {
      throw new Error("배송 상태가 수정되지 않았습니다.");
    }
    return updatedOrder;
  }

  // 주문 삭제
  async deleteOrder(orderInfoRequired) {
    const { orderId } = orderInfoRequired;
    if (!orderId) {
      throw new Error("주문 정보가 없습니다.");
    }
    const deletedOrder = await this.orderModel.deleteById(orderId);
    if (!deletedOrder) {
      throw new Error("주문이 정상적으로 삭제되지 않았습니다.");
    }
    return deletedOrder;
  }

  // 상품 수정
  async setProduct(productId, toUpdate) {
    if (!productId || !toUpdate) {
      throw new Error("상품 정보가 없습니다.");
    }
    // 우선 해당 id의 상품이 db에 있는지 확인
    const product = await this.productModel.findById(productId);

    //db에서 찾지 못한 경우, 에러 메시지 반환
    if (!product) {
      throw new Error("상품 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    //업데이트 진행
    const updatedProduct = await this.productModel.update({
      productId,
      update: toUpdate,
    });
    if (!updatedProduct) {
      throw new Error("상품 수정이 되지 않았습니다.");
    }
    return updatedProduct;
  }

  // 주문 상품 삭제
  async deleteOrderProduct({ orderId, productId }) {
    if (!orderId || !productId) {
      throw new Error("주문 정보가 없습니다.");
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
      throw new Error("주문 상품이 삭제되지 않았습니다.");
    }
    if (newOrder.orderList.length < 1) {
      return await this.orderModel.deleteById(orderId);
    }

    return newOrder;
  }

  // 상품 삭제
  async deleteProduct(productIdArray) {
    if (!productIdArray) {
      throw new Error("삭제할 상품을 선택해 주세요.");
    }
    const deletedProduct = await productIdArray.map((productId) =>
      this.productModel.deleteById({ productId })
    );
    if (!deletedProduct) {
      throw new Error("상품이 삭제되지 않았습니다.");
    }
    return deletedProduct;
  }

  // 회원 정보 삭제
  async deleteUser(userInfoRequired) {
    const { email } = userInfoRequired;
    if (!email) {
      throw new Error("회원 이메일 정보가 없습니다.");
    }
    const deletedUser = await this.userModel.deleteByEmail(email);
    if (!deletedUser) {
      throw new Error("회원 정보가 삭제되지 않았습니다.");
    }
    return deletedUser;
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

  // 관리자 계정 확인
  async adminVerify(userId) {
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }

    const userRole = user.role;
    if (userRole !== "admin") {
      throw new Error("관리자가 아니면 접속할 수  없습니다.");
    }
  }

  async exceptPwd(userInfo) {
    return await (({ password, ...o }) => o)(userInfo);
  }
}

export const adminService = new AdminService(
  userModel,
  orderModel,
  productModel
);
