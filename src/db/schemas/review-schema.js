import { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    starRating: {
      type: Number,
      require: true,
    },
  },
  {
    collection: "reviews",
    timestamps: true,
  }
);

export { ReviewSchema };
