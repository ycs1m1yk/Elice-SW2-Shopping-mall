import * as Api from "/api.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

const paintProduct = (product) => {
  const productImageTag = document.getElementById("productImageTag");
  const manufacturerTag = document.getElementById("manufacturerTag");
  const titleTag = document.getElementById("titleTag");
  const priceTag = document.getElementById("priceTag");
  const detailDescriptionTag = document.getElementById("detailDescriptionTag");

  productImageTag.src = product.img;
  manufacturerTag.innerText = product.brandName;
  titleTag.innerText = product.name;
  priceTag.innerText = product.price;
  detailDescriptionTag.innerText = product.detailDescription;
};

const getDataFromApi = async () => {
  const url = new URL(location.href);
  const productId = url.searchParams.get("id");

  const product = await Api.get("/api/product", productId);
  paintProduct(product);
};

getDataFromApi();
