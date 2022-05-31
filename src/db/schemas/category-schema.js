import { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
  },
  {
    collection: "category",
    timestamps: true,
  }
);

export { CategorySchema };
