import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { categoryService } from "../services";
import { adminService } from "../services";
import { loginRequired, upload } from "../middlewares";

const categoryRouter = Router();

//카테고리 목록 조회
categoryRouter.get("/", async function (req, res, next) {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

//카테고리 추가
categoryRouter.post(
  "/add",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      //admin 확인 작업
      const userId = req.currentUserId;
      await adminService.adminVerify(userId);

      const { location: img } = req.file;
      const { name, description } = req.body;

      const newCategory = await categoryService.addCategory({
        name,
        description,
        img,
      });

      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

//카테고리id를 통해 특정 카테고리 정보 보내기
categoryRouter.get("/:id", loginRequired, async function (req, res, next) {
  try {
    //admin 확인 작업
    const userId = req.currentUserId;
    await adminService.adminVerify(userId);

    const categoryId = req.params.id;
    const categoryInfo = await categoryService.getCategoryById(categoryId);
    // 카테고리 정보를 JSON 형태로 프론트에 보냄
    res.status(200).json(categoryInfo);
  } catch (error) {
    next(error);
  }
});

//카테고리 업데이트
categoryRouter.put(
  "/:id/update",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      if (is.emptyObject(req.body)) {
        throw new Error(
          "headers의 Content-Type을 application/json으로 설정해주세요"
        );
      }
      //admin 확인 작업
      const userId = req.currentUserId;
      await adminService.adminVerify(userId);

      const categoryId = req.params.id;

      const { location: img } = req.file;
      const { name, description } = req.body;

      const toUpdate = {
        ...(img && { img }),
        ...(name && { name }),
        ...(description && { description }),
      };

      // 카테고리 정보를 업데이트함.
      const updatedCategoryInfo = await categoryService.setCategory(
        categoryId,
        toUpdate
      );
      res.status(200).json(updatedCategoryInfo);
    } catch (error) {
      next(error);
    }
  }
);

//카테고리 삭제 기능
categoryRouter.delete(
  "/delete",
  loginRequired,
  async function (req, res, next) {
    try {
      //admin 확인 작업
      const userId = req.currentUserId;
      await adminService.adminVerify(userId);

      const categoryIdList = req.body.categoryIdList;
      const deleteCategoryInfo = await categoryService.deleteCategory(
        categoryIdList
      );

      res.status(200).json(deleteCategoryInfo);
    } catch (error) {
      next(error);
    }
  }
);

export { categoryRouter };
