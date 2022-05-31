import { model } from "mongoose";
import { QnaSchema } from "../schemas/qna-schema";

const Qna = model("qnas", QnaSchema);

export class QnaModel {
  async findAll() {
    return await Qna.find({});
  }
  async findById(_id) {
    return await Qna.findOne({ _id });
  }

  async findByUserId(userId) {
    return await Qna.find({ userId });
  }

  async findByQuestionId(questionId) {
    return await Qna.find({ questionId });
  }
  async create(qnaInfo) {
    return await Qna.create(qnaInfo);
  }
}

export const qnaModel = new QnaModel();
