import { productModel } from "../db";

class ProductService {
  // 본 파일의 맨 아래에서, new UserService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor(productModel) {
    this.productModel = productModel;
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

  // 상품 전체 목록 확인
  async getProducts() {
    return await this.productModel.findAll();
  }
  //카테고리별 상품 목록 확인
  async getProductsByCategory(category) {
    return await this.productModel.findByCategory(category);
  }
  //유저별 상품 목록 확인
  async getProductsByUserId(userId) {
    return await this.productModel.findByUserId(userId);
  }

  //상품 id로 상세 조회
  async getProductByProductId(productId) {
    return await this.productModel.findById(productId);
  }

  // 상품정보 수정(미완성), 현재 비밀번호가 있어야 수정 가능함.
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

  async getProductsForDelete(productIdList) {
    let productList = [];
    for await (const productId of productIdList) {
      const product = this.productModel.findById(productId);
      productList.push(product);
    }
    return productList;
  }

  async deleteProduct(productIdArray) {
    let product = await productIdArray.map((productId) =>
      this.productModel.deleteById({ productId })
    );
    return product;
  }
}

export const productService = new ProductService(productModel);
