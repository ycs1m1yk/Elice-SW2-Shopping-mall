import { commentModel } from "../db";

class CommentService {
  constructor(commentModel) {
    this.commentModel = commentModel;
  }

  async getComments() {
    return await this.commentModel.findAll();
  }

  async getCommentsByUserId(userId) {
    return await this.commentModel.findByUserId(userId);
  }

  async getCommentsByProductId(productId) {
    return await this.commentModel.findByProductId(productId);
  }

  async getCommentByCommentId(commentId) {
    return await this.commentModel.findById(commentId);
  }

  async addComment(commentInfo) {
    return await this.commentModel.create(commentInfo);
  }
  // 후기 수정
  async setComment(commentId, toUpdate) {
    //우선 해당 id의 후기가 db에 있는지 확인
    let comment = await this.commentModel.findById(commentId);

    //db에서 찾지 못한 경우, 에러 메시지 반환
    if (!comment) {
      throw new Error("후기 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }
    //업데이트 진행
    return await this.commentModel.update({
      commentId,
      update: toUpdate,
    });
  }

  async getCommentsForDelete(commentIdList) {
    let commentList = [];
    for await (const commentId of commentIdList) {
      const comment = this.commentModel.findById(commentId);
      commentList.push(comment);
    }
    return commentList;
  }

  async deleteComment(commentIdArray) {
    let comment = await commentIdArray.map((commentId) =>
      this.commentModel.deleteById({ commentId })
    );
    return comment;
  }
}

export const commentService = new CommentService(commentModel);
