import { productModel } from "../db";
import { userModel } from "../db";

class ProductService {
  // 본 파일의 맨 아래에서, new UserService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor(productModel, userModel) {
    this.productModel = productModel;
    this.userModel = userModel;
  }

  // product-add
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
      !brandName ||
      !img ||
      !shortDescription ||
      !detailDescription ||
      !userId
    ) {
      throw new Error("상품 정보를 모두 입력해주세요.");
    }
    //셀러 확인
    const userInfo = await this.userModel.findById(userId);
    if (userInfo.role !== "seller") {
      throw new Error("판매자로 등록해야만 상품 등록이 가능합니다.");
    }
    // 상품명 중복 확인
    const productName = await this.productModel.findByName(name);
    if (productName) {
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

  // 상품 전체 목록 확인
  async getProducts() {
    const products = await this.productModel.findAll();
    if (!products) {
      throw new Error("상품 목록이 존재하지 않습니다.");
    }
    return products;
  }
  //카테고리별 상품 목록 확인
  async getProductsByCategory(category) {
    const products = await this.productModel.findByCategory(category);
    if (!products) {
      throw new Error("해당 카테고리에 상품이 존재하지 않습니다.");
    }
    return products;
  }

  //상품 id로 상세 조회
  async getProductByProductId(productId) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new Error("해당 상품이 존재하지 않습니다.");
    }
    return product;
  }
  //
  async getProductForUpdate(productId, userId) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new Error("상품 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    if (product.userId !== userId) {
      throw new Error("Forbidden");
    }
    const userInfo = await this.userModel.findById(userId);
    if (userInfo.role !== "seller") {
      throw new Error("Forbidden");
    }
    return product;
  }

  // 상품정보 수정(미완성), 현재 비밀번호가 있어야 수정 가능함.
  async setProduct(userId, productId, toUpdate) {
    //우선 해당 id의 상품이 db에 있는지 확인
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new Error("상품 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    if (product.userId !== userId) {
      throw new Error("Forbidden");
    }
    const userInfo = await this.userModel.findById(userId);
    if (userInfo.role !== "seller") {
      throw new Error("Forbidden");
    }
    //업데이트 진행
    return await this.productModel.update({
      productId,
      update: toUpdate,
    });
  }

  async checkProductsForDelete(userId, productIdList) {
    const userInfo = await this.userModel.findById(userId);
    if (userInfo.role !== "seller") {
      throw new Error("Forbidden");
    }
    let productList = [];
    for (const productId of productIdList) {
      const product = await this.productModel.findById(productId);
      productList.push(product);
    }
    productList.map((productInfo) => {
      if (userId !== productInfo.userId) {
        throw new Error("Forbidden");
      }
    });
  }

  async deleteProduct(productIdArray) {
    let product = await productIdArray.map((productId) =>
      this.productModel.deleteById({ productId })
    );
    return product;
  }
}

export const productService = new ProductService(productModel, userModel);
