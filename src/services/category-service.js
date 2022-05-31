import { categoryModel } from "../db";

class CategoryService {
  constructor(categoryModel) {
    this.categoryModel = categoryModel;
  }
  async addCategory(categoryInfo) {
    const name = categoryInfo.name;
    const category = await this.categoryModel.findByName(name);
    if (category) {
      throw new Error(
        "이 카테고리명은 현재 사용중입니다. 다른 카테고리명을 입력해 주세요."
      );
    }
    return await this.categoryModel.create(categoryInfo);
  }
}

export const categoryService = new CategoryService(categoryModel);
