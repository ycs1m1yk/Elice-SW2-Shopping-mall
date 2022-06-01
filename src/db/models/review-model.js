import { model } from "mongoose";
import { ReviewSchema } from "../schemas/review-schema";

const Review = model("reviews", ReviewSchema);

export class ReviewModel {
  async findAll() {
    return await Review.find({});
  }
  async findById(_id) {
    return await Review.findOne({ _id });
  }

  async findByUserId(userId) {
    return await Review.find({ userId });
  }

  async findByProductId(productId) {
    return await Review.find({ productId });
  }

  async create(reviewInfo) {
    return await Review.create(reviewInfo);
  }
  async update({ reviewId, update }) {
    const filter = { _id: reviewId };
    const option = { returnOriginal: false };

    return await Comment.findOneAndUpdate(filter, update, option);
  }

  async deleteById({ reviewId }) {
    const filter = { _id: reviewId };
    return await Review.findOneAndDelete(filter);
  }
}

export const reviewModel = new ReviewModel();
