import header from "/components/Header.js";
import * as Api from "/api.js";
import { getToken } from "/useful-functions.js";

document.body.insertAdjacentElement("afterbegin", header);

const categoryForm = document.getElementById("categoryForm");

let categoryArr = [];

// 화면 그리기
const paintCategoryList = (categoryList) => {
  let categoryBox = ""; // 현재 카테고리가 담길 공간
  categoryList.forEach((category) => {
    categoryBox += `
    <div class="field" data-name="${category.name}">
      <ul class="control">
        <li
          class="input edit-link"
          id="categoryInput"
          onclick="location.href = '/category/add?category=${category._id}'"
        >
        ${category.name}
        </li>
        <div id="buttonBox">
          <button style="background-color: #e91f1f; margin-top:3px;" id="categoryDeleteButton" class="delete is-medium"></button>
        </div>
      </ul>
    </div>
    `;
  });

  categoryForm.innerHTML = categoryBox;
  const buttons = document.querySelectorAll("#categoryDeleteButton");

  for (const button of buttons) {
    button.addEventListener("click", handleCategoryDelete);
  }
};

const handleCategoryDelete = async (e) => {
  e.preventDefault();
  const targetName = e.target.closest(".field").dataset.name;

  const targetCategory = categoryArr.filter(
    (category) => category[1] === targetName
  );

  const bodyData = [targetCategory.flat(Infinity)[0]];

  await fetch("/api/category/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      categoryIdList: bodyData,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.result === "error") {
        location.reload();
        return alert(result.reason);
      }
      location.reload();
      alert("카테고리가 성공적으로 삭제되었습니다.");
    });
};

const getDataFromApi = async () => {
  const categoryList = await Api.get("/api/category");

  // 삭제를 위해 카테고리 [아이디, 이름]으로 이루어진 이차원 배열 생성
  categoryList.forEach(({ _id, name, ...rest }) =>
    categoryArr.push([_id, name])
  );

  paintCategoryList(categoryList);
};

getDataFromApi();
