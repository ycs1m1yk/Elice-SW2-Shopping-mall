import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { upload } from "../middlewares";
import { adminService } from "../services";
import { contentTypeChecker } from "../utils/content-type-checker";

const adminRouter = Router();

// 전체 회원 목록 조회
adminRouter.get("/users", loginRequired, async (req, res, next) => {
  try {
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    // 관리자 계정 검증
    await adminService.adminVerify(userId);
    // db에서 전체 회원 목록 가져옴
    const users = await adminService.getUsers();
    // 회원 정보에서 password를 제외하고 front에 전달
    const usersWithoutPwd = await users.map((e) => {
      return adminService.exceptPwd(e._doc);
    });
    res.status(200).json(usersWithoutPwd);
  } catch (error) {
    next(error);
  }
});

// 전체 주문 목록 조회
adminRouter.get("/orders", loginRequired, async (req, res, next) => {
  try {
    const userId = req.currentUserId;
    // 관리자 계정 검증
    await adminService.adminVerify(userId);
    // db에서 전체 주문 목록 가져옴
    const orders = await adminService.getOrders();
    // front에 데이터 전달
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

// 관리자가 상품 추가
adminRouter.post(
  "/product/add",
  upload.single("image-file"),
  loginRequired,
  async (req, res, next) => {
    try {
      // Content-Type 체크
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      // 관리자 계정 검증
      await adminService.adminVerify(userId);

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

      // db에 상품 추가
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
      // front에 데이터 전달
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

// 회원 권한 수정
adminRouter.put("/user/:email", loginRequired, async (req, res, next) => {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    const { email } = req.params;
    const { role } = req.body;
    const userId = req.currentUserId;
    // 관리자 계정 검증
    await adminService.adminVerify(userId);

    const userInfoRequired = { email };

    const toUpdate = {
      ...(role && { role }),
    };
    // db에 회원 정보 수정
    const updateduserRole = await adminService.setUserRole(
      userInfoRequired,
      toUpdate
    );
    // 회원 정보에서 password를 제외하고 front에 전달
    const userWithoutPwd = await adminService.exceptPwd(updateduserRole._doc);
    // front에 데이터 전달
    res.status(200).json(userWithoutPwd);
  } catch (error) {
    next(error);
  }
});

// 배송 상태 수정
adminRouter.put(
  "/order/:orderId/:productId",
  loginRequired,
  async (req, res, next) => {
    try {
      // Content-Type 체크
      contentTypeChecker(req.body);
      const { orderId, productId } = req.params;
      const userId = req.currentUserId;
      const { status } = req.body;
      // 관리자 계정 검증
      await adminService.adminVerify(userId);

      const orderInfoRequired = { orderId, productId };

      const toUpdate = {
        ...(status && { status }),
      };
      // db에서 배송 상태 수정
      const updatedOrderStatus = await adminService.setOrderStatus(
        orderInfoRequired,
        toUpdate
      );

      // front에 데이터 전달

      res.status(200).json(updatedOrderStatus);
    } catch (error) {
      next(error);
    }
  }
);

// 상품 정보 수정
adminRouter.put(
  "/product/:productId",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      // Content-Type 체크
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      // 관리자 계정 검증
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

      // db에 상품 정보 수정
      const updatedProductInfo = await adminService.setProduct(
        productId,
        toUpdate
      );
      // front에 데이터 전달
      res.status(200).json(updatedProductInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 회원 정보 삭제
adminRouter.delete("/user/:email", loginRequired, async (req, res, next) => {
  try {
    const userEmail = req.params.email;
    const userId = req.currentUserId;

    // 관리자 계정 검증
    await adminService.adminVerify(userId);

    const userInfoRequired = { email: userEmail };
    // db에 회원 정보 삭제
    const deleteUserInfo = await adminService.deleteUser(userInfoRequired);
    // 회원 정보에서 password를 제외하고 front에 전달
    const userWithoutPwd = await adminService.exceptPwd(deleteUserInfo._doc);
    // front에 데이터 전달
    res.status(200).json(userWithoutPwd);
  } catch (error) {
    next(error);
  }
});

// 주문 정보 삭제
adminRouter.delete(
  "/order/delete",
  loginRequired,
  async function (req, res, next) {
    try {
<<<<<<< HEAD
      // Content-Type 체크
      contentTypeChecker(req.body);
      const { orderId, productId } = req.body; // 배열
=======
      const { productIdList } = req.body;
      console.log(productIdList);
>>>>>>> 83affa258320e92349a19650e048e06cee82bc28
      const userId = req.currentUserId;
      // 관리자 계정 검증
      adminService.adminVerify(userId);
      // db에 주문 정보 삭제
      const deleteOrderInfo = await adminService.deleteOrderProduct({
        orderId,
        productId,
      });
      // front에 데이터 전달
      res.status(200).json(deleteOrderInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 상품 정보 삭제
adminRouter.delete(
  "/product/delete",
  loginRequired,
  async function (req, res, next) {
    try {
      // Content-Type 체크
      contentTypeChecker(req.body);
      const { productIdList } = req.body;
      const userId = req.currentUserId;
      // 관리자 계정 검증
      await adminService.adminVerify(userId);
      // db에 상품 정보 삭제
      const deleteProductInfo = await adminService.deleteProduct(productIdList);
      // front에 데이터 전달
      res.status(200).json(deleteProductInfo);
    } catch (error) {
      next(error);
    }
  }
);

export { adminRouter };
