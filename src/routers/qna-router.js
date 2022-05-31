import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { qnaService } from "../services";

const qnaRouter = Router();

//전체 큐엔에이 조회
qnaRouter.get("/", async function (req, res, next) {
  try {
    const qna = await qnaService.getQna();

    res.status(200).json(qna);
  } catch (error) {
    next(error);
  }
});

//특정 유저 큐엔에이 목록 조회
qnaRouter.get(
  "/commentlist/user",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      const qna = await this.qnaService.getQnaByUserId(userId);

      res.status(200).json(qna);
    } catch (error) {
      next(error);
    }
  }
);

// 특정 상품 큐엔에이 목록 조회
qnaRouter.get("/:productId", async function (req, res, next) {
  try {
    const productId = req.params.productId;
    const qna = await qnaService.getQnaByProductId(productId);

    res.status(200).json(qna);
  } catch (error) {
    next(error);
  }
});

//qna 작성(미완)
qnaRouter.post(
  "/:productId/add",
  loginRequired,
  async function (req, res, next) {
    try {
      const productId = req.params.productId;
      const userId = req.currentUserId;

      const { title, content, category, type, questionId } = req.body;

      const newQna = await qnaService.addQna({
        title,
        content,
        category,
        type,
        questionId,
        productId,
        userId,
      });

      res.json(201).json(newQna);
    } catch (error) {
      next(error);
    }
  }
);

export { qnaRouter };
