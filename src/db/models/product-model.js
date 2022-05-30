import { model } from "mongoose";
import { ProductSchema } from "../schemas/product-schema";

const Product = model("products", ProductSchema);

export class ProductModel {
  async findByName(name) {
    return await Product.findOne({ name });
  }

  async findById(_id) {
    return await Product.findOne({ _id });
  }

  async findByCategory(category) {
    return await Product.find({ category });
  }

  async findAll() {
    return await Product.find({});
  }

  async findByUserId(userId) {
    return await Product.find({ userId });
  }

  async create(productInfo) {
    return await Product.create(productInfo);
  }

  async update({ productId, update }) {
    const filter = { _id: productId };
    const option = { returnOriginal: false };

    return await Product.findOneAndUpdate(filter, update, option);
  }

  async deleteById({ productId }) {
    const filter = { _id: productId };
    return await Product.findOneAndDelete(filter);
  }
}

export const productModel = new ProductModel();

