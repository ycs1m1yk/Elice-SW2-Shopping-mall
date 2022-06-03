import { model } from "mongoose";
import { CategorySchema } from "../schemas/category-schema";

const Category = model("category", CategorySchema);

export class CategoryModel {
  async findByName(name) {
    return await Category.findOne({ name });
  }

  async findById(_id) {
    return await Category.findOne({ _id });
  }

  async findAll() {
    return await Category.find({});
  }

  async create(categoryInfo) {
    return await Category.create(categoryInfo);
  }

  async update({ categoryId, update }) {
    const filter = { _id: categoryId };
    const option = { returnOriginal: false };

    return await Category.findOneAndUpdate(filter, update, option);
  }

  async deleteById({ categoryId }) {
    const filter = { _id: categoryId };
    return await Category.findOneAndDelete(filter);
  }
}
export const categoryModel = new CategoryModel();
