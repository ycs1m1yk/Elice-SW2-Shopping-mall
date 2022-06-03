import { Router } from "express";
import { loginRequired } from "../middlewares";
import { productService } from "../services";
import { upload } from "../middlewares";
import { contentTypeChecker } from "../utils/content-type-checker";
const productRouter = Router();

// 전체 상품 목록 조회
productRouter.get("/", async function (req, res, next) {
  try {
    // db에서 전체 상품 목록 가져옴
    const products = await productService.getProducts();
    // 상품 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

//상품 상세정보 조회
productRouter.get("/:id", async function (req, res, next) {
  try {
    const productId = req.params.id;
    //db에서 상품 정보를 가져옴
    const productInfo = await productService.getProductByProductId(productId);
    // 상품 정보를 JSON 형태로 프론트에 보냄
    res.status(200).json(productInfo);
  } catch (error) {
    next(error);
  }
});

// 카테고리별 상품 목록 조회
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

//상품 수정 위해 상품 데이터 조회
productRouter.get(
  "/:id/update",
  loginRequired,
  async function (req, res, next) {
    try {
      // 토큰에서 userId 추출
      const userId = req.currentUserId;
      const productId = req.params.id;
      // db에서 user가 등록한 상품을 가져옴
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

// 상품 판매
productRouter.post(
  "/add",
  upload.single("image-file"),
  loginRequired,
  async (req, res, next) => {
    try {
      // Content-Type 체크
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

      // 위 데이터를 상품 db에 추가
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

      // 추가된 상품의 데이터를 JSON 형태로 프론트에 보냄
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

//상품 정보 수정
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
      // 업데이트한 상품 정보를 JSON 형태로 프론트에 보냄
      res.status(200).json(updatedProductInfo);
    } catch (error) {
      next(error);
    }
  }
);

//상품 판매 삭제
productRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);

    const productIdList = req.body.productIdList;
    const userId = req.currentUserId;
    // 판매자 계정 검증
    await productService.checkProductsForDelete(userId, productIdList);
    // db에 회원 정보 삭제
    const deleteProductInfo = await productService.deleteProduct(productIdList);
    // 상품 삭제 정보 데이터를 JSON 형태로 프론트에 보냄
    res.status(200).json(deleteProductInfo);
  } catch (error) {
    next(error);
  }
});

export { productRouter };
