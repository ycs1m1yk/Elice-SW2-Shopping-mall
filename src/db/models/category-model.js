import { model } from "mongoose";
import { CategorySchema } from "../schemas/category-schema";

const Category = model("category", CategorySchema);

export class CategoryModel {
  async create(categoryInfo) {
    return await Category.create(categoryInfo);
  }

  async findByName(name) {
    return await Category.findOne({ name });
  }
  async findAll() {
    return await Category.find({});
  }
}
export const categoryModel = new CategoryModel();
