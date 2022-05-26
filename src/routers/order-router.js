import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { orderService } from "../services";

const orderRouter = Router();

// 주문하기 api (아래는 /complete이지만, 실제로는 /api/order/complete로 요청해야 함.)
orderRouter.post("/complete", loginRequired, async (req, res, next) => {
  try {
    // Content-Type: application/json 설정을 안 한 경우, 에러를 만들도록 함.
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    // req (request)의 body 에서 데이터 가져오기
    // 배송지 정보
    const userId = req.currentUserId;
    const fullName = req.body.fullName;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.phoneNumber;
    const requirement = req.body.requirement;
    // 결제정보
    const orderList = [null];
    const totalPrice = 0;
    const shippingFee = 0;

    // 위 데이터를 유저 db에 추가하기
    const newOrder = await orderService.addOrder({
      userId,
      fullName,
      phoneNumber,
      email,
      requirement,
      orderList,
      totalPrice,
      shippingFee,
    });

    // 추가된 유저의 db 데이터를 프론트에 다시 보내줌
    // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

// 개인 주문 목록 보기 api (아래는 /:userId 이지만, 실제로는 /api/order/userId로 요청해야 함.)
orderRouter.get("/:userId", loginRequired, async function (req, res, next) {
  try {
    const userId = req.params.userId;
    if (userId !== req.currentUserId) {
      throw new Error("본인의 주문 목록만 조회할 수 있습니다.");
    }

    // 로그인 진행 (로그인 성공 시 jwt 토큰을 프론트에 보내 줌)
    const orderInfo = await orderService.getOrders(userId);
    // jwt 토큰을 프론트에 보냄 (jwt 토큰은, 문자열임)
    res.status(200).json(orderInfo);
  } catch (error) {
    next(error);
  }
});

orderRouter.delete("/:orderId", loginRequired, async function (req, res, next) {
  try {
    const orderId = req.params.orderId;
    const userId = req.currentUserId;
    console.log("orderId", orderId);

    const orderInfo = await orderService.getOrders(orderId);
    if (userId !== orderInfo.userId) {
      throw new Error("본인의 주문 내역만 취소할 수 있습니다.");
    }
    const orderInfoRequired = { userId, orderId };
    // 사용자 정보를 업데이트함.
    const deleteOrderInfo = await orderService.deleteUser(orderInfoRequired);
    console.log("삭제 완료");
    // 업데이트 이후의 유저 데이터를 프론트에 보내 줌
    res.status(200).json(deleteOrderInfo);
  } catch (error) {
    next(error);
  }
});

export { orderRouter };
