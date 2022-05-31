import { Schema } from "mongoose";

const QnaSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "question",
    },
    questionId: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
    }
  },
  {
    collection: "products",
    timestamps: true,
  }
);

export { QnaSchema };
