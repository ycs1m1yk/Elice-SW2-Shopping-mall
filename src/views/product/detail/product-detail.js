import * as Api from "/api.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

const getDataFromApi = async () => {
  const url = new URL(location.href);
  const productId = url.searchParams.get("id");

  const product = await Api.get("/api/product", productId);
  console.log(product);
};

getDataFromApi();
