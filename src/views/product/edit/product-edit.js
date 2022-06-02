import header from "/components/Header.js";
import * as Api from "/api.js";
import { getToken, decodeJWT } from "/useful-functions.js";

document.body.insertAdjacentElement("afterbegin", header);

const productForm = document.getElementById("productForm");
const productArr = [];

// 화면 그리기
const paintProductList = (productList) => {
  let productBox = ""; // 현재 카테고리가 담길 공간
  productList.forEach((product) => {
    productBox += `
    <div class="field" data-name="${product.name}">
      <ul class="control">
        <li
          class="input edit-link"
          id="productInput"
          onclick="location.href = '/product/add?product=${product._id}'"
        >
        ${product.name}
        </li>
        <div id="buttonBox">
          <button style="background-color: #e91f1f; margin-top:3px;" id="productDeleteButton" class="delete is-medium"></button>
        </div>
      </ul>
    </div>
    `;
  });

  productForm.innerHTML = productBox;
  const buttons = document.querySelectorAll("#productDeleteButton");

  for (const button of buttons) {
    button.addEventListener("click", handleProductDelete);
  }
};

const handleProductDelete = async (e) => {
  console.log(e.target);
  e.preventDefault();
  const targetName = e.target.closest(".field").dataset.name;

  const targetProduct = productArr.filter(
    (product) => product[1] === targetName
  );

  const bodyData = [targetProduct.flat(Infinity)[0]];

  await fetch("/api/product/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      productIdList: bodyData,
    }),
  }).then((res) => {
    if (res.ok) {
      location.reload();
      return alert("상품이 성공적으로 삭제되었습니다.");
    }
    location.reload();
    alert("본인이 등록한 상품이 아닙니다. 다시 시도해주십시오.");
  });
};

const getDataFromApi = async () => {
  const token = decodeJWT(localStorage.getItem("token"));
  let productList;
  if (token.role === "admin") {
    productList = await Api.get("/api/product");
  } else if (token.role === "seller") {
    productList = await Api.get("/api/user/sellinglist");
  }

  console.log(productList);
  productList.forEach(({ _id, name, ...rest }) => productArr.push([_id, name]));

  console.log(productArr);
  paintProductList(productList);
};

getDataFromApi();
