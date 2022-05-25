import { model } from "mongoose";
import { ProductSchema } from "../schemas/product-schema";

const Product = model("product", ProductSchema);

export class ProductModel {
  async findByProductName(name) {
    const product = await Product.find({ name });
    return product;
  }

  async findById(userId) {
    const user = await User.findOne({ _id: userId });
    return user;
  }

  async create(userInfo) {
    const createdNewUser = await User.create(userInfo);
    return createdNewUser;
  }

  async findAll() {
    const users = await User.find({});
    return users;
  }

  async update({ userId, update }) {
    const filter = { _id: userId };
    const option = { returnOriginal: false };

    const updatedUser = await User.findOneAndUpdate(filter, update, option);
    return updatedUser;
  }
}

const userModel = new UserModel();

export { userModel };
