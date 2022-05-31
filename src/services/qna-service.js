import { qnaModel } from "../db";

class QnaService {
  constructor(qnaModel) {
    this.qnaModel = qnaModel;
  }

  async getQna() {
    return await this.qnaModel.findAll();
  }

  async getQnaByUserId(userId) {
    return await this.qnaModel.findByUserId(userId);
  }

  async getQnaByProductId(productId) {
    return await this.qnaModel.findByQnaId(productId);
  }

  async getQnaByQnaId(qnaId) {
    return await this.qnaModel.findById(qnaId);
  }

  async addQna(qnaInfo) {
    return await this.qnaModel.create(qnaInfo);
  }
}

export const qnaService = new QnaService(qnaModel);
