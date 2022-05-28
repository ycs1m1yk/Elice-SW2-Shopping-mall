import { model } from "mongoose";
import { OrderSchema } from "../schemas/order-schema";

const Order = model("orders", OrderSchema);

export class OrderModel {
  async findByUserId(userId) {
    return await Order.find({ userId });
  }

  async findById(_id) {
    return await Order.findOne({ _id });
  }

  async create(orderInfo) {
    return await Order.create(orderInfo);
  }

  async findAll() {
    return await Order.find({});
  }

  async deleteById(_id) {
    return await Order.findOneAndDelete({ _id });
  }
}

export const orderModel = new OrderModel();
