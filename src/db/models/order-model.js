import { model } from "mongoose";
import { OrderSchema } from "../schemas/order-schema";

const Order = model("orders", OrderSchema);

export class OrderModel {
  async findByUserId(userId) {
    const order = await Order.find({ userId });
    return order;
  }

  async findByOrderId(orderId) {
    console.log("파인드전", orderId);
    const order = await Order.findOne({ _id: orderId });
    console.log("파인드후", order._id);
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
    const deleteProduct = await Order.findOneAndDelete(filter);
    return deleteProduct;
  }
}

const orderModel = new OrderModel();

export { orderModel };
