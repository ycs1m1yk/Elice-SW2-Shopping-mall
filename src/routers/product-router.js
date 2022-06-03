import { Router } from "express";
import { loginRequired } from "../middlewares";
import { productService } from "../services";
import { upload } from "../middlewares";
import { contentTypeChecker } from "../utils/content-type-checker";
const productRouter = Router();

// 전체 상품 가져오기 api (아래는 / 이지만, 실제로는 /api/product로 요청해야 함.)
productRouter.get("/", async function (req, res, next) {
  try {
    // 전체 상품 목록을 얻음
    const products = await productService.getProducts();
    // 상품 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

//상품 상세 페이지 api (아래는 /:id 이지만, 실제로는 /api/product/:id로 요청해야 함)
productRouter.get("/:id", async function (req, res, next) {
  try {
    const productId = req.params.id;
    const productInfo = await productService.getProductByProductId(productId);
    // 상품 스키마를 JSON 형태로 프론트에 보냄
    res.status(200).json(productInfo);
  } catch (error) {
    next(error);
  }
});

// 카테고리별 상품 목록 api
productRouter.get("/category/:category", async (req, res, next) => {
  try {
    const category = req.params.category;

    // 특정 카테고리에 맞는 상품 목록을 얻음
    const products = await productService.getProductsByCategory(category);
    // 상품 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

//상품 수정 위해 상품 데이터 보내기 api (아래는 /:id/update 이지만, 실제로는 /api/product/:id/update로 요청해야 함)
productRouter.get(
  "/:id/update",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      const productId = req.params.id;
      const productInfo = await productService.getProductForUpdate(
        productId,
        userId
      );
      // 상품 데이터를 JSON 형태로 프론트에 보냄
      res.status(200).json(productInfo);
    } catch (error) {
      next(error);
    }
  }
);

//상품 정보 수정 api (아래는 /:id/update 이지만, 실제로는 /api/product/:id/update로 요청해야 함.)
productRouter.put(
  "/:id/update",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      const productId = req.params.id;
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
      const updatedProductInfo = await productService.setProduct(
        userId,
        productId,
        toUpdate
      );
      res.status(200).json(updatedProductInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 상품 판매 api (아래는 /add 이지만, 실제로는 /api/product/add로 요청해야 함.)
productRouter.post(
  "/add",
  upload.single("image-file"),
  loginRequired,
  async (req, res, next) => {
    try {
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
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

      // 위 데이터를 상품 db에 추가하기
      const newProduct = await productService.addProduct({
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

      // 추가된 상품의 db 데이터를 프론트에 다시 보내줌
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

//상품 판매 삭제
productRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    contentTypeChecker(req.body);

    const productIdList = req.body.productIdList;
    const userId = req.currentUserId;

    await productService.checkProductsForDelete(userId, productIdList);

    const deleteProductInfo = await productService.deleteProduct(productIdList);
    res.status(200).json(deleteProductInfo);
  } catch (error) {
    next(error);
  }
});

export { productRouter };
