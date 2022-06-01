import { reviewModel } from "../db";

class ReviewService {
  constructor(reviewModel) {
    this.reviewModel = reviewModel;
  }

  async getReviews() {
    return await this.reviewModel.findAll();
  }

  async getReviewsByUserId(userId) {
    return await this.reviewModel.findByUserId(userId);
  }

  async getReviewsByProductId(productId) {
    return await this.reviewModel.findByProductId(productId);
  }

  async getReviewByReviewId(reviewId) {
    return await this.reviewModel.findById(reviewId);
  }

  async addReview(reviewInfo) {
    return await this.reviewModel.create(reviewInfo);
  }
  // 후기 수정
  async setReview(reviewId, toUpdate) {
    //우선 해당 id의 후기가 db에 있는지 확인
    let review = await this.reviewModel.findById(reviewId);

    //db에서 찾지 못한 경우, 에러 메시지 반환
    if (!review) {
      throw new Error("후기 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    //업데이트 진행
    return await this.reviewModel.update({
      reviewId,
      update: toUpdate,
    });
  }

  async getReviewsForDelete(reviewIdList) {
    let reviewList = [];
    for await (const reviewId of reviewIdList) {
      const review = this.reviewModel.findById(reviewId);
      reviewList.push(review);
    }
    return reviewList;
  }

  async deleteReview(reviewIdArray) {
    let review = await reviewIdArray.map((reviewId) =>
      this.reviewModel.deleteById({ reviewId })
    );
    return review;
  }
}

export const reviewService = new ReviewService(reviewModel);
