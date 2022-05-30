import { model } from "mongoose";
import { CommentSchema } from "../schemas/comment-schema";

const Comment = model("comments", CommentSchema);

export class CommentModel {
    async findAll() {
        return await Comment.find({});
    }
    async findById(_id) {
        return await Comment.findOne({ _id });
    }

    async findByUserId(userId) {
        return await Comment.find({ userId });
    }

    async findByProductId(productId) {
        return await Comment.find({ productId });
    }

    async create(commentInfo) {
        return await Comment.create(commentInfo);
    }
}

export const commentModel = new CommentModel();