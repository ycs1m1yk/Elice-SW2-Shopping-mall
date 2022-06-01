import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { categoryService } from "../services";
import { adminService } from "../services";
import { loginRequired, upload } from "../middlewares";

const categoryRouter = Router();

//카테고리 목록 조회
categoryRouter.get("/", loginRequired, async function (req, res, next) {
  try {
    //admin 확인작업
    const userId = req.currentUserId;
    await adminService.adminVerify(userId);
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

export { categoryRouter };
