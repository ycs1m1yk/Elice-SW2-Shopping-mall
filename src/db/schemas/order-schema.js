import { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: new Schema(
        {
          postalCode: String,
          address1: String,
          address2: String,
          receiverName: String,
          receiverPhoneNumber: Number,
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
        quantity: Number,
        price: Number,
        status: String,
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
