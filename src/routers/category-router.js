import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { categoryService } from "../services";
import { upload } from "../middlewares";

const categoryRouter = Router();

//카테고리 추가
categoryRouter.post(
  "/add",
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      const { location: img } = req.file;
      const { name, description, theme } = req.body;

      const newCategory = await categoryService.addCategory({
        name,
        description,
        theme,
        img,
      });

      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

export { categoryRouter };
