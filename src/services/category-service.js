import { categoryModel } from "../db";

class CategoryService {
  constructor(categoryModel) {
    this.categoryModel = categoryModel;
  }

  // 전체 카테고리 조회
  async getCategories() {
    const categorise = await this.categoryModel.findAll();
    //db 데이터 확인
    if (!categorise) {
      throw new Error("카테고리가 존재하지 않습니다.");
    }
    return categorise;
  }

  // 카테고리 id를 통해 특정 카테고리 정보 조회
  async getCategoryById(categoryId) {
    // body 데이터 확인
    if (!categoryId) {
      throw new Error("카테고리 아이디가 존재하지 않습니다.");
    }
    const category = await this.categoryModel.findById(categoryId);
    // db데이터 확인
    if (!category) {
      throw new Error("해당 아이디의 카테고리가 존재하지 않습니다.");
    }
    return category;
  }

  // 카테고리 추가
  async addCategory(categoryInfo) {
    const { name, description, img } = categoryInfo;
    // db 데이터 확인
    if (!name || !description || !img) {
      throw new Error("카테고리 정보를 모두 입력해주세요.");
    }
    const category = await this.categoryModel.findByName(name);
    // 카테고리명 중복 확인
    if (category) {
      throw new Error(
        "이 카테고리명은 현재 사용중입니다. 다른 카테고리명을 입력해 주세요."
      );
    }
    // db에 카테고리 추가
    return await this.categoryModel.create(categoryInfo);
  }

  // 카테고리 수정
  async setCategory(categoryId, toUpdate) {
    // 해당 id의 카테고리가 db에 있는지 확인
    let category = await this.categoryModel.findById(categoryId);

    //db 데이터 확인
    if (!category) {
      throw new Error("카테고리 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    //업데이트 진행
    return await this.categoryModel.update({
      categoryId,
      update: toUpdate,
    });
  }

  async deleteCategory(categoryIdArray) {
    // body 데이터 확인
    if (categoryIdArray.length < 1) {
      throw new Error("삭제할 카테고리가 없습니다.");
    }
    // 카테고리 id에 따라 해당 카테고리 삭제
    let category = await categoryIdArray.map((categoryId) =>
      this.categoryModel.deleteById({ categoryId })
    );
    return category;
  }
}

export const categoryService = new CategoryService(categoryModel);
