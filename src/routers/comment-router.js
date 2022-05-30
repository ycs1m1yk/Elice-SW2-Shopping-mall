import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { borderService } from "../services";
import { upload } from "../middlewares";
import { commentService } from "../services/comment-service";

const commentRouter = Router();

//전체 후기글 조회
commentRouter.get("/", async function(req, res, next){ 
  try {
    const comment = await commentService.getComments();

    res.status(200).json(comment);
  } catch(error){
    next(error);
  }
});

//특정 유저 상품 후기 목록
commentRouter.get("/commentlist/user", loginRequired, async function (req, res, next) {
  try {
    const userId = req.currentUserId;
    const comments = await this.commentService.getCommentsByUserId(userId);
    
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
})

// 특정 상품 후기 목록 조회
commentRouter.get("/:productId", async function(req, res, next){
  try {
    const productId = req.params.productId;
    const comments = await commentService.getCommentsByProductId(productId);
    
    res.status(200).json(comments)
  } catch(error) {
    next(error);
  }
})

//후기글 작성(미완)
commentRouter.post("/add/:productId", loginRequired, async function(req, res, next){
  try {
    const productId = req.params.productId;
    const userId = req.currentUserId;

    // 1인당 1개의 후기 확인 절차 생각중

    const {
      text,
      starRating,
      parentComment
    } = req.body;

    const newComment = await commentService.addComment({
      productId,
      userId,
      test,
      starRating,
      parentComment
    });
    
    res.json(201).json(newComment)

  } catch (error) {
    next(error);
  }
})

