import { model } from "mongoose";
import { UserSchema } from "../schemas/user-schema";

const User = model("users", UserSchema);

export class UserModel {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(_id) {
    return await User.findOne({ _id });
  }

  async create(userInfo) {
    return await User.create(userInfo);
  }

  async findAll() {
    return await User.find({});
  }

  async update({ userId, update }) {
    const filter = { _id: userId };
    const option = { returnOriginal: false };

    return await User.findOneAndUpdate(filter, update, option);
  }

  async deleteById(_id) {
    return await User.findOneAndDelete({ _id });
  }

  async deleteByEmail(email) {
    return await User.findOneAndDelete({ email });
  }
}

export const userModel = new UserModel();
