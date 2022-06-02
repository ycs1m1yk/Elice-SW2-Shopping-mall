import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { upload } from "../middlewares";
import { adminService } from "../services";
import { contentTypeChecker } from "../utils/content-type-checker";

const adminRouter = Router();

// 전체 유저 목록을 가져옴 (배열 형태임)
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
adminRouter.get("/users", loginRequired, async (req, res, next) => {
  try {
    // 관리자 계정 검증
    const userId = req.currentUserId;
    await adminService.adminVerify(userId);
    const users = await adminService.getUsers();
    const usersWithoutPwd = await users.map((e) => {
      return adminService.exceptPwd(e._doc);
    });
    res.status(200).json(usersWithoutPwd);
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/user/:email", loginRequired, async (req, res, next) => {
  try {
    // 관리자 계정 검증
    contentTypeChecker(req.body);
    const { email } = req.params;
    const { role } = req.body;
    const userId = req.currentUserId;

    await adminService.adminVerify(userId);

    const userInfoRequired = { email };
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

    const userWithoutPwd = adminService.exceptPwd(updateduserRole._doc);
    // 업데이트 이후의 유저 데이터를 프론트에 보내 줌

    res.status(200).json(userWithoutPwd);
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
    const userWithoutPwd = adminService.exceptPwd(deleteUserInfo._doc);
    res.status(200).json(userWithoutPwd);
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

adminRouter.put(
  "/order/:orderId/:productId",
  loginRequired,
  async (req, res, next) => {
    try {
      // 관리자 계정 검증
      contentTypeChecker(req.body);
      const { orderId, productId } = req.params;
      const userId = req.currentUserId;
      const { status } = req.body;

      await adminService.adminVerify(userId);

      const orderInfoRequired = { orderId, productId };
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

//상품 정보 수정
adminRouter.put(
  "/product/:productId",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      contentTypeChecker(req.body);
      const userId = "1234";
      //admin인지 확인
      await adminService.adminVerify(userId);

      const productId = req.params.productId;
      const { location: img } = req.file;
      const {
        name,
        price,
        category,
        quantity,
        brandName,
        keyword,
        shortDescription,
        detailDescription,
      } = req.body;

      const toUpdate = {
        ...(img && { img }),
        ...(name && { name }),
        ...(price && { price }),
        ...(category && { category }),
        ...(quantity && { quantity }),
        ...(brandName && { brandName }),
        ...(keyword && { keyword }),
        ...(shortDescription && { shortDescription }),
        ...(detailDescription && { detailDescription }),
      };

      // 상품 정보를 업데이트함.
      const updatedProductInfo = await adminService.setProduct(
        productId,
        toUpdate
      );
      res.status(200).json(updatedProductInfo);
    } catch (error) {
      next(error);
    }
  }
);
// 상품 삭제
adminRouter.delete(
  "/product/delete",
  loginRequired,
  async function (req, res, next) {
    try {
      const { productIdList } = req.body;
      const userId = req.currentUserId;
      await adminService.adminVerify(userId); //admin인지 확인

      const deleteProductInfo = await adminService.deleteProduct(productIdList);

      res.status(200).json(deleteProductInfo);
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/product/add",
  upload.single("image-file"),
  loginRequired,
  async (req, res, next) => {
    try {
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      await adminService.adminVerify(userId); //admin인지 확인

      const { location: img } = req.file;
      const {
        name,
        price,
        category,
        quantity,
        brandName,
        keyword,
        shortDescription,
        detailDescription,
      } = req.body;

      // 위 데이터를 유저 db에 추가하기
      const newProduct = await adminService.addProduct({
        name,
        price,
        img,
        category,
        quantity,
        brandName,
        keyword,
        shortDescription,
        detailDescription,
        userId,
      });

      // 추가된 유저의 db 데이터를 프론트에 다시 보내줌
      // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

export { adminRouter };
