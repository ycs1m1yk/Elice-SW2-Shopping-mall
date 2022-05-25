import { model } from "mongoose";
import { OrderSchema } from "../schemas/order-schema";

const Order = model("orders", OrderSchema);

export class OrderModel {
  async findByUserId(userId) {
    const order = await Order.findOne({ userId });
    return order;
  }

  async create(orderInfo) {
    const createdNewOrder = await Order.create(orderInfo);
    return createdNewOrder;
  }

  async findAll() {
    const orders = await Order.find({});
    return orders;
  }

  async deleteByProductId({ productId }) {
    const filter = { _id: productId };
    const deleteProduct = await User.findOneAndDelete(filter);
    return deleteProduct;
  }
}

const orderModel = new OrderModel();

export { orderModel };
