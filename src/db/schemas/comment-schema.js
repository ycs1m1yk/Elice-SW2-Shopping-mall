import { Schema } from "mongoose";

const CommentSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    collation: "comments",
    timestamps: true,
  }
);

export { CommentSchema };
