import { Schema } from "mongoose";

const OrderListSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: [String],
      required: true,
    },
    quantity: {
      type: [Number],
      required: true,
    },
    price: {
      type: [Number],
      required: true,
    },
    status: {
      type: [String],
      required: false,
      default: "상품 준비중",
    },
  },
  {
    collection: "orderLists",
    timestamps: true,
  }
);

export { OrderListSchema };
