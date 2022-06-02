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
    const users = await this.userModel.findAll();
    if (!users) {
      throw new Error("사용자 목록을 불러오지 못했습니다.");
    }
    return users;
  }

  async deleteUser(userInfoRequired) {
    const { email } = userInfoRequired;
    if (!email) {
      throw new Error("삭제할 계정을 선택해주세요.");
    }
    const deletedUser = await this.userModel.deleteByEmail(email);
    if (deletedUser) {
      throw new Error("계정을 삭제하지 못했습니다.");
    }
    return deletedUser;
  }

  async getOrders() {
    const orders = await this.orderModel.findAll();
    if (!orders) {
      throw new Error("주문 목록을 불러오지 못했습니다.");
    }
    return orders;
  }

  async setOrderStatus(orderInfoRequired, toUpdate) {
    const { orderId, productId } = orderInfoRequired;
    const { status } = toUpdate;
    if (!orderId || !productId || !status) {
      throw new Error("특정 주문 상품의 배송 상황을 변경해주세요.");
    }
    const updateOrderList = await this.orderModel.findById(orderId);
    const newUpdate = await updateOrderList.orderList.map((e) => {
      if (e.productId === productId) {
        e.status = status;
      }
      return e;
    });

    const update = { $set: { orderList: newUpdate } };
    const updatedOrder = await this.orderModel.update({ orderId, update });
    if (!updatedOrder) {
      throw new Error("배송 상태를 변경하지 못했습니다.");
    }
    return updatedOrder;
  }

  async deleteOrder(orderInfoRequired) {
    const { orderId } = orderInfoRequired;
    if (!orderId) {
      throw new Error("삭제할 주문을 선택해 주세요.");
    }
    const deletedOrder = await this.orderModel.deleteById(orderId);
    return deletedOrder;
  }

  // 관리자 계정 확인
  async adminVerify(userId) {
    if (!userId) {
      throw new Error("아이디가 존재하지 않습니다.");
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const userRole = user.role;
    if (userRole !== "admin") {
      throw new Error("Forbidden");
    }
  }

  async setUserRole(userInfoRequired, toUpdate) {
    const { email } = userInfoRequired;
    if (!email) {
      throw new Error("변경할 유저를 선택해 주세요.");
    }
    const userInfo = await this.userModel.findByEmail(email);
    const userId = userInfo._id;
    const updatedUser = await this.userModel.update({
      userId,
      update: toUpdate,
    });
    if (!updatedUser) {
      throw new Error("유저 정보를 업데이트 하지 못했습니다.");
    }
    return updatedUser;
  }

  // 비밀번호 일치 여부 확인
  async userVerify(userId, currentPassword) {
    if (!userId || !currentPassword) {
      throw new Error("아이디가 존재하지 않거나 잘못된 비밀번호 입니다.");
    }
    let user = await this.userModel.findById(userId);
    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      throw new Error("Unauthorized");
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

  async exceptPwd(userInfo) {
    return (({ password, ...o }) => o)(userInfo);
  }

  async setProduct(productId, toUpdate) {
    const {
      img,
      name,
      price,
      category,
      quantity,
      brandName,
      keyword,
      shortDescription,
      detailDescription,
    } = toUpdate;

    if (
      !productId ||
      !img ||
      !name ||
      !price ||
      !category ||
      !shortDescription ||
      !detailDescription
    ) {
      throw new Error("Need to All Elements in body");
    }
    //우선 해당 id의 상품이 db에 있는지 확인
    const product = await this.productModel.findById(productId);

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
    if (!productIdArray) {
      throw new Error("Need to productIdArray");
    }
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
    if (
      !name ||
      !price ||
      !category ||
      !img ||
      !shortDescription ||
      !detailDescription
    ) {
      throw new Error("Need to All Elements in body");
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
