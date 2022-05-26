import { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: false,
      default: 0,
    },
    img: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: false,
      default: 0,
    },
    brandName: {
      type: String,
      required: false,
      default: null,
    },
    keyword: {
      type: [String],
      required: false,
    },
    shortdecription: {
      type: String,
      required: true,
    },
    detaildecription: {
      type: String,
      required: true,
    },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

export { ProductSchema };
