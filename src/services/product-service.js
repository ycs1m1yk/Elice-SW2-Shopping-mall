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
      size,
      brandName,
      keyword,
      shortdescription,
      detaildescription,
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
      size,
      brandName,
      keyword,
      shortdescription,
      detaildescription,
    };
    // 상품명 중복은 이제 아니므로, 상품 등록을 진행함
    const createdNewProduct = await this.productModel.create(newProductInfo);

    return createdNewProduct;
  }

  // 상품 전체 목록 확인
  async getProducts() {
    const products = await this.productModel.findAll();
    return products;
  }
  //상품 카테고리별 목록 확인
  async getProductsByCategory(category) {
    const products = await this.productModel.findByCategory(category);
    return products;
  }

  // 상품정보 수정(미완성), 현재 비밀번호가 있어야 수정 가능함.
  // async setProduct(userInfoRequired, toUpdate) {
  // 객체 destructuring
  //const { userId, currentPassword } = userInfoRequired;

  // 우선 해당 id의 상품이 db에 있는지 확인
  //let user = await this.userModel.findById(userId);

  // db에서 찾지 못한 경우, 에러 메시지 반환
  // if (!user) {
  //   throw new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
  // }

  // 이제 드디어 업데이트 시작

  // 비밀번호도 변경하는 경우에는, 회원가입 때처럼 해쉬화 해주어야 함.
  // const { password } = toUpdate;

  // if (password) {
  //   const newPasswordHash = await bcrypt.hash(password, 10);
  //   toUpdate.password = newPasswordHash;
  // }

  // 업데이트 진행
  //   user = await this.userModel.update({
  //     userId,
  //     update: toUpdate,
  //   });

  //   return user;
  // }
}
const productService = new ProductService(productModel);
export { productService };
