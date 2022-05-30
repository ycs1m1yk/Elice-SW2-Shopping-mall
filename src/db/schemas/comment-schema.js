import { Schema } from "mongoose";

const CommentSchema = new Schema (
    {
        productId: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        starRating: {
            type: Number,
            require: true
        },
        parentComment: {
            type: String,
            required: false
        },
    },
    {
        collation: "comments",
        timestamps: true
    }
)

export { CommentSchema }