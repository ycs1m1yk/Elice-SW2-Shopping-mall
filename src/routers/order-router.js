import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { orderService } from "../services";
import { contentTypeChecker } from "../utils/content-type-checker";
const orderRouter = Router();

// 주문하기 api (아래는 /complete이지만, 실제로는 /api/order/complete로 요청해야 함.)
orderRouter.post("/complete", loginRequired, async (req, res, next) => {
  try {
    // Content-Type: application/json 설정을 안 한 경우, 에러를 만들도록 함.
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    contentTypeChecker(req.body);

    const userId = req.currentUserId;
    // req (request)의 body 에서 데이터 가져오기

    const {
      addressName,
      receiverName,
      receiverPhoneNumber,
      postalCode,
      address1,
      address2,
      request,
      orderList,
      totalPrice,
      shippingFee,
    } = req.body;

    const address = {
      addressName,
      receiverName,
      receiverPhoneNumber,
      postalCode,
      address1,
      address2,
    };
    const wholeorderList = Object.values(orderList).map((e) => ({
      productId: e.productId,
      title: e.title,
      quantity: e.quantity,
      price: e.price,
      status: e.status,
    }));

    // 위 데이터를 주문 db에 추가하기
    const newOrder = await orderService.addOrder({
      userId,
      address,
      request,
      orderList: wholeorderList,
      totalPrice,
      shippingFee,
    });

    // 추가된 주문 db 데이터를 프론트에 다시 보내줌
    // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

// 내 주문 목록 보기 api (아래는 /:userId 이지만, 실제로는 /api/order/:userId로 요청해야 함.)
orderRouter.get("/orderList", loginRequired, async function (req, res, next) {
  try {
    const userId = req.currentUserId;

    const orderInfo = await orderService.getOrders(userId);

    res.status(200).json(orderInfo);
  } catch (error) {
    next(error);
  }
});

orderRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    contentTypeChecker(req.body);
    const { orderId, productId } = req.body; // 배열
    const userId = req.currentUserId;

    const deleteOrderInfo = await orderService.deleteProduct({
      orderId,
      productId,
      userId,
    });

    res.status(200).json(deleteOrderInfo);
  } catch (error) {
    next(error);
  }
});

export { orderRouter };
