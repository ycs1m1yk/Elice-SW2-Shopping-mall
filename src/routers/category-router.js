import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { categoryService } from "../services";
import { adminService } from "../services";
import { loginRequired, upload } from "../middlewares";
import { contentTypeChecker } from "../utils/content-type-checker";
const categoryRouter = Router();

// 전체 카테고리 목록 조회
categoryRouter.get("/", async function (req, res, next) {
  try {
    // db에서 카테고리 목록 가져오기
    const categories = await categoryService.getCategories();
    // 카테고리 목록을 JSON 형태로 프론트에 보냄
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

// 특정 카테고리 정보 조회
categoryRouter.get("/:id", loginRequired, async function (req, res, next) {
  try {
    const userId = req.currentUserId;
    // 관리자 계정 검증
    await adminService.adminVerify(userId);

    const categoryId = req.params.id;
    const categoryInfo = await categoryService.getCategoryById(categoryId);
    // 카테고리 정보를 JSON 형태로 프론트에 보냄
    res.status(200).json(categoryInfo);
  } catch (error) {
    next(error);
  }
});

// 카테고리 추가
categoryRouter.post(
  "/add",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      // 관리자 계정 검증
      await adminService.adminVerify(userId);

      const { location: img } = req.file;
      const { name, description } = req.body;
      // db에 카테고리 추가
      const newCategory = await categoryService.addCategory({
        name,
        description,
        img,
      });
      // 추가한 카테고리 데이터를 JSON 형태로 프론트에 보냄
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

// 카테고리 수정
categoryRouter.put(
  "/:id/update",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      contentTypeChecker(req.body);

      const userId = req.currentUserId;
      // 관리자 계정 검증
      await adminService.adminVerify(userId);

      const categoryId = req.params.id;
      const { location: img } = req.file;
      const { name, description } = req.body;

      const toUpdate = {
        ...(img && { img }),
        ...(name && { name }),
        ...(description && { description }),
      };

      // db의 카테고리 정보 수정
      const updatedCategoryInfo = await categoryService.setCategory(
        categoryId,
        toUpdate
      );
      // 수정된 카테고리 데이터를 JSON 형태로 프론트에 보냄
      res.status(200).json(updatedCategoryInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 카테고리 삭제
categoryRouter.delete(
  "/delete",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      // 관리자 계정 검증
      await adminService.adminVerify(userId);

      const categoryIdList = req.body.categoryIdList;
      // db에서 카테고리 삭제
      const deleteCategoryInfo = await categoryService.deleteCategory(
        categoryIdList
      );
      // 삭제된 카테고리 데이터를 JSON 형태로 프론트에 보냄
      res.status(200).json(deleteCategoryInfo);
    } catch (error) {
      next(error);
    }
  }
);

export { categoryRouter };
