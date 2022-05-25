import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
// import { userService } from '../services';
import { cartModel } from "../db/models/cart-model";
import { userModel } from "../db/models/user-model";

const cartRouter = Router();

// 장바구니 조회
// 카트에 저장된 상품 목록을 가져옴 (배열 형태임)
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
cartRouter.get("/:userId", loginRequired, async function (req, res, next) {
  try {
    // 전체 사용자 목록을 얻음
    const customerEmail = await userModel.findById({ id: req.currentUserId });
    const cartInfo = await cartModel.findByCustomerEmail(customerEmail);
    // 카트목록을 JSON 형태로 프론트에 보냄
    res.status(200).json(cartInfo);
  } catch (error) {
    next(error);
  }
});

// 장바구니 수정
cartRouter.patch("/:userId", loginRequired, async (req, res) => {
  try {
    // content-type 을 application/json 로 프론트에서
    // 설정 안 하고 요청하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    // loginRequired 미들웨어에서 생성된 Id를 가져옴
    const userId = req.currentUserId;
    // body data 로부터 업데이트할 상품의 수량을 추출함.
    const newQuantity = req.body.quantity;

    const updateCartInfo = await cartService.setQuantity(newQuantity); // model update 메소드 반환

    res.status(200).json(updateCartInfo);
  } catch (err) {
    next(err);
  }
});

// 장바구니 부분 삭제

// 장바구니 전체 삭제

cartRouter.delete("/:userId", loginRequired, async (req, res) => {
  try {
    // content-type 을 application/json 로 프론트에서
    // 설정 안 하고 요청하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }
    // const deleteSelect = req.body.체크박스 데이터
    // loginRequired 미들웨어에서 생성된 Id를 가져옴
    const userId = req.currentUserId;
    // body data 로부터 업데이트할 상품의 수량을 추출함.
    if (req.query.all === "true") {
      await cartService.deleteAll(userId);
    } else {
      await cartService.deleteSelect(userId, deleteSelect);
    }

    res.status(200).json({ success: true }); // 장바구니로 redirect
  } catch (err) {
    next(err);
  }
});

export { cartRouter };
