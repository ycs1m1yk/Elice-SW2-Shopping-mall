import { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    address: {
      type: new Schema(
        {
          addressName: String,
          receiverName: String,
          receiverPhoneNumber: Number,
          postalCode: String,
          address1: String,
          address2: String,
        },
        {
          _id: false,
        }
      ),
      required: true,
    },
    request: {
      type: String,
      required: false,
      default: "요청사항 없음",
    },
    orderList: [
      new Schema({
        productId: String,
        title: String,
        quantity: Number,
        price: Number,
        status: {
          type: String,
          required: false,
          default: "상품 준비중",
        },
      }),
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: false,
      default: 5000,
    },
  },
  {
    collection: "orders",
    timestamps: true,
  }
);

export { OrderSchema };
