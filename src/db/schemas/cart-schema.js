import { Schema } from "mongoose";

const CartSchema = new Schema(
  {
    productId: {
      type: [Number],
      required: true,
    },
    name: {
      type: [String],
      required: true,
    },
    price: {
      type: [Number],
      required: true,
    },
    quantity: {
      type: [Number],
      required: false,
      default: 0,
    },
    img: {},
    size: {
      type: [Number],
      required: false,
      default: 0,
    },
    brandName: {
      type: [String],
      required: false,
      default: "",
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: new Schema(
        {
          postalCode: String,
          address1: String,
          address2: String,
        },
        {
          _id: false,
        }
      ),
      required: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

export { CartSchema };
