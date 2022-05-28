import { model } from "mongoose";
import { ProductSchema } from "../schemas/product-schema";

const Product = model("products", ProductSchema);

export class ProductModel {
  async findByProductName(productName) {
    const product = await Product.findOne({ name: productName });
    return product;
  }

  async findByProductId(productId) {
    const product = await Product.findOne({ _id: productId });
    return product;
  }

  async findByCategory(category) {
    const products = await Product.find({ category });
    return products;
  }

  async findByUserId(userId) {
    const products = await Product.find({ userId });
    return products;
  }

  async create(productInfo) {
    const createdNewProduct = await Product.create(productInfo);
    return createdNewProduct;
  }

  async findAll() {
    const products = await Product.find({});
    return products;
  }

  async update({ productId, update }) {
    const filter = { _id: productId };
    const option = { returnOriginal: false };

    const updatedProduct = await Product.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedProduct;
  }

  async deleteByproductId({ productId }) {
    const filter = { _id: productId };
    const deleteProduct = await Product.findOneAndDelete(filter);
    return deleteProduct;
  }
}

const productModel = new ProductModel();

export { productModel };
