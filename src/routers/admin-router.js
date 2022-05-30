import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { adminService } from "../services";

const adminRouter = Router();

// 전체 유저 목록을 가져옴 (배열 형태임)
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
adminRouter.get("/users", loginRequired, async (req, res, next) => {
  try {
    // 관리자 계정 검증
    const userId = req.currentUserId;
    await adminService.adminVerify(userId);

    const users = await adminService.getUsers();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/user/:email", loginRequired, async (req, res, next) => {
  try {
    // 관리자 계정 검증

    const { email } = req.params;
    const userId = req.currentUserId;
    const { role } = req.body;

    await adminService.adminVerify(userId);

    const userInfoRequired = { userId };
    // 위 데이터가 undefined가 아니라면, 즉, 프론트에서 업데이트를 위해
    // 보내주었다면, 업데이트용 객체에 삽입함.
    const toUpdate = {
      ...(role && { role }),
    };
    // 사용자 정보를 업데이트함.
    const updateduserRole = await adminService.setUserRole(
      userInfoRequired,
      toUpdate
    );

    // 업데이트 이후의 유저 데이터를 프론트에 보내 줌

    res.status(200).json(updateduserRole);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/user/:email", loginRequired, async (req, res, next) => {
  try {
    const userEmail = req.params.email;
    const userId = req.currentUserId;
    // 관리자 계정 검증
    await adminService.adminVerify(userId);

    const userInfoRequired = { email: userEmail };

    const deleteUserInfo = await adminService.deleteUser(userInfoRequired);
    res.status(200).json(deleteUserInfo);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/orders", loginRequired, async (req, res, next) => {
  try {
    // 관리자 계정 검증
    const userId = req.currentUserId;
    await adminService.adminVerify(userId);

    const orders = await adminService.getOrders();

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch(
  "/order/:orderId/:index",
  loginRequired,
  async (req, res, next) => {
    try {
      // 관리자 계정 검증

      const { orderId, index } = req.params;
      const userId = req.currentUserId;
      const { status } = req.body;

      await adminService.adminVerify(userId);

      const orderInfoRequired = { orderId, index };
      // 위 데이터가 undefined가 아니라면, 즉, 프론트에서 업데이트를 위해
      // 보내주었다면, 업데이트용 객체에 삽입함.
      const toUpdate = {
        ...(status && { status }),
      };
      // 사용자 정보를 업데이트함.
      const updateduserRole = await adminService.setOrderStatus(
        orderInfoRequired,
        toUpdate
      );

      // 업데이트 이후의 유저 데이터를 프론트에 보내 줌

      res.status(200).json(updateduserRole);
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.delete("/order/:orderId", loginRequired, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.currentUserId;

    await adminService.adminVerify(userId);
    const orderInfoRequired = { orderId };
    const deleteUserInfo = await adminService.deleteOrder(orderInfoRequired);
    res.status(200).json(deleteUserInfo);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/category/add", loginRequired, async (req, res) => {});

export { adminRouter };