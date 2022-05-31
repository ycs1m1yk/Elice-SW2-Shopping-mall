import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { commentService } from "../services";
import { upload } from "../middlewares";

const commentRouter = Router();

//전체 후기글 조회
commentRouter.get("/", async function (req, res, next) {
  try {
    const comments = await commentService.getComments();

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
});

//특정 유저 상품 후기 목록 조회-- > 넣을 필요 있을까 고민
commentRouter.get(
  "/commentlist/user",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      const comments = await this.commentService.getCommentsByUserId(userId);

      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }
);

// 특정 상품 후기 목록 조회
commentRouter.get("/:productId", async function (req, res, next) {
  try {
    const productId = req.params.productId;
    const comments = await commentService.getCommentsByProductId(productId);

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
});

//후기글 상세 조회
commentRouter.get("/:id", async function (req, res, next) {
  try {
    const commentId = req.params.id;
    const comment = await commentService.getCommentByCommentId(commentId);

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
});

//후기글 작성
commentRouter.post(
  "/:productId/add",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      const productId = req.params.productId;
      const userId = req.currentUserId;

      // 1인당 1개의 후기 확인 절차 생각중
      const { location: img } = req.file;
      const { text, starRating } = req.body;

      const newComment = await commentService.addComment({
        productId,
        userId,
        text,
        img,
        starRating,
      });

      res.json(201).json(newComment);
    } catch (error) {
      next(error);
    }
  }
);

//후기 글 업데이트
commentRouter.put(
  "/:id/update",
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
      const commentId = req.params.id;
      const commentInfo = await commentService.getCommentByCommentId(commentId);
      if (userId !== commentInfo.userId) {
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
      const updatedCommentInfo = await commentService.setComment(
        commentId,
        toUpdate
      );
      res.status(200).json(updatedCommentInfo);
    } catch (error) {
      next(error);
    }
  }
);

commentRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    const commentIdList = req.body.commentIdList;
    const userId = req.currentUserId;

    const CommentList = await commentService.getCommentsForDelete(
      commentIdList
    );

    CommentList.map((commentInfo) => {
      if (userId !== commentInfo.userId) {
        throw new Error("본인의 후기 작성 내역만 취소할 수 있습니다.");
      }
    });

    const deleteCommentInfo = await commentService.deleteComment(commentIdList);

    res.status(200).json(deleteCommentInfo);
  } catch (error) {
    next(error);
  }
});

export { commentRouter };
