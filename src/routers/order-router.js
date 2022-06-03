import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { orderService } from "../services";
import { contentTypeChecker } from "../utils/content-type-checker";
const orderRouter = Router();

// 내 주문 목록 조회
orderRouter.get("/orderList", loginRequired, async function (req, res, next) {
  try {
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    // db에 주문 목록 조회
    const orderInfo = await orderService.getOrders(userId);
    // front에 데이터 전달
    res.status(200).json(orderInfo);
  } catch (error) {
    next(error);
  }
});

// 주문하기
orderRouter.post("/complete", loginRequired, async (req, res, next) => {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);

    // 토큰에서 userId 추출
    const userId = req.currentUserId;

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

    // 각 주소 정보를 하나의 address 객체에 삽입
    const address = {
      addressName,
      receiverName,
      receiverPhoneNumber,
      postalCode,
      address1,
      address2,
    };
    // 한 번 주문할 때 상품이 여러개 이므로, 객체로 받아 배열로 변환한다.
    const wholeorderList = Object.values(orderList).map((e) => ({
      productId: e.productId,
      title: e.title,
      quantity: e.quantity,
      price: e.price,
      status: e.status,
    }));

    // db에 주문 정보 추가
    const newOrder = await orderService.addOrder({
      userId,
      address,
      request,
      orderList: wholeorderList,
      totalPrice,
      shippingFee,
    });

    // front에 새로 추가된 주문 정보 전달
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

// 주문 상품 삭제
orderRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    const { orderId, productId } = req.body;
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    // db에 주문의 특정 상품 삭제
    const deleteOrderInfo = await orderService.deleteOrderProduct({
      orderId,
      productId,
      userId,
    });
    // front에 주문 정보 전달
    res.status(200).json(deleteOrderInfo);
  } catch (error) {
    next(error);
  }
});

export { orderRouter };
