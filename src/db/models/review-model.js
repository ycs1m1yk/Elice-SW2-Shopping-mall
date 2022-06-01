import { model } from "mongoose";
import { ReviewSchema } from "../schemas/review-schema";

const Review = model("reviews", ReviewSchema);

export class ReviewModel {
  async findAll() {
    return await Review.find({});
  }
  async findAllByPage(page, perPage) {
    return await Review.find({})
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage);
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

  async findByProductIdByPage(productId, page, perPage) {
    return await Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage);
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
  async countReview(productId) {
    return await Review.countDocuments({ productId });
  }
}

export const reviewModel = new ReviewModel();
