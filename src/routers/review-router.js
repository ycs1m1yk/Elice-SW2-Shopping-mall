import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { reviewService } from "../services";
import { upload } from "../middlewares";

const reviewRouter = Router();

//전체 후기글 조회
reviewRouter.get("/", async function (req, res, next) {
  try {
    // if (reviews.length < 1) {
    //   throw new Error("후기가 없습니다.")
    // }
    
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

//특정 유저 상품 후기 목록 조회-- >  userRouter에 넣을가 고민
reviewRouter.get(
  "/reviewlist/user",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      const reviews = await this.reviewService.getReviewsByUserId(userId);

      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
);

// 특정 상품 후기 목록 조회 pagenation
reviewRouter.get("/:productId", async function (req, res, next) {
  try {
    const productId = req.params.productId;
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 10);
    const total = await reviewService.getReviewTotalNumber(productId); // 총 리뷰 수 세기
    const reviews = await reviewService.getReviewsByPage(
      productId,
      page,
      perPage
    ); //review 데이터를 최근 순으로 정렬
    const totalPage = Math.ceil(total / perPage);
    let reviewList = [];
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

//후기글 작성
reviewRouter.post(
  "/:productId",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      const productId = req.params.productId;
      const userId = req.currentUserId;

      // 1인당 1개의 후기 확인 절차 생각중
      const { location: img } = req.file;
      const { text, starRating } = req.body;

      const newReview = await reviewService.addReview({
        productId,
        userId,
        text,
        img,
        starRating,
      });

      res.json(201).json(newReview);
    } catch (error) {
      next(error);
    }
  }
);

//후기글 상세 조회
reviewRouter.get("/:id", async function (req, res, next) {
  try {
    const reviewId = req.params.id;
    const review = await reviewService.getReviewByReviewId(reviewId);

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
});

//후기 글 업데이트
reviewRouter.put(
  "/:id/edit",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      if (is.emptyObject(req.body)) {
        throw new Error(
          "headers의 Content-Type을 application/json으로 설정해주세요"
        );
      }
      const userId = req.currentUserId;
      const reviewId = req.params.id;
      const reviewInfo = await reviewService.getReviewByReviewId(reviewId);
      if (userId !== reviewInfo.userId) {
        throw new Error("본인의 후기 내역만 수정할 수 있습니다.");
      }

      const { location: img } = req.file;
      const { text, starRating } = req.body;

      const toUpdate = {
        ...(img && { img }),
        ...(text && { text }),
        ...(starRating && { starRating }),
      };

      // 사용자 정보를 업데이트함.
      const updatedReviewInfo = await reviewService.setReview(
        reviewId,
        toUpdate
      );
      res.status(200).json(updatedReviewInfo);
    } catch (error) {
      next(error);
    }
  }
);

reviewRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    const reviewIdList = req.body.reviewIdList;
    const userId = req.currentUserId;

    const ReviewList = await reviewService.getReviewsForDelete(reviewIdList);

    ReviewList.map((reviewInfo) => {
      if (userId !== reviewInfo.userId) {
        throw new Error("본인의 후기 작성 내역만 취소할 수 있습니다.");
      }
    });

    const deleteReviewInfo = await reviewService.deleteReview(reviewIdList);

    res.status(200).json(deleteReviewInfo);
  } catch (error) {
    next(error);
  }
});

export { reviewRouter };
