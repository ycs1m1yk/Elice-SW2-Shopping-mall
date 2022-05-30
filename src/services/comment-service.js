import { productModel } from "../db";
import { commentModel } from "../db/models/comment-model";

class CommentService {
    constructor(commentModel){
        this.commentModel = commentModel;
    }

    async getComments(){
        return await this.commentModel.findAll();
    }

    async getCommentsByUserId(userId){
        return await this.commentModel.findByUserId(userId); 
    }

    async getCommentsByProductId(productId){
        return await this.commentModel.findByCommentId(productId); 
    }

    async getCommentByCommentId(commentId){
        return await this.commentModel.findById(commentId);
    }
    
    async addComment(commentInfo){

    }
}

export const commentService = new CommentService(commentModel);