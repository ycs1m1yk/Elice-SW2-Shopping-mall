import { categoryModel } from "../db";

class CategoryService {
  constructor(categoryModel) {
    this.categoryModel = categoryModel;
  }
  async addCategory(categoryInfo) {
    const { name, description } = categoryInfo;
    if (!name || !description) {
      throw new Error("Need All Elements in body");
    }
    const category = await this.categoryModel.findByName(name);
    if (category) {
      throw new Error(
        "이 카테고리명은 현재 사용중입니다. 다른 카테고리명을 입력해 주세요."
      );
    }
    return await this.categoryModel.create(categoryInfo);
  }

  async getCategories() {
    const categorise = await this.categoryModel.findAll();
    if (!categorise) {
      throw new Error("카테고리가 존재하지 않습니다.");
    }
    return categorise;
  }

  async getCategoryById(categoryId) {
    if (!categoryId) {
      throw new Error("카테고리 아이디가 존재하지 않습니다.");
    }
    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      throw new Error("해당 아이디의 카테고리가 존재하지 않습니다.");
    }
    return category;
  }

  async setCategory(categoryId, toUpdate) {
    //우선 해당 id의 상품이 db에 있는지 확인
    let category = await this.categoryModel.findById(categoryId);

    //db에서 찾지 못한 경우, 에러 메시지 반환
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
    if (categoryIdArray.length < 1) {
      throw new Error("카테고리 선택을 올바를게 해주세요.");
    }
    let category = await categoryIdArray.map((categoryId) =>
      this.categoryModel.deleteById({ categoryId })
    );
    return category;
  }
}

export const categoryService = new CategoryService(categoryModel);
