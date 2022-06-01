import header from "/components/Header.js";
import { getToken } from "/useful-functions.js";
import * as Api from "/api.js";

document.body.insertAdjacentElement("afterbegin", header);

const registerProductForm = document.getElementById("registerProductForm");
const keywordContainer = document.getElementById("keywordContainer");
const categorySelectBox = document.getElementById("categorySelectBox");

const imageInput = document.getElementById("imageInput");
const searchKeywordInput = document.getElementById("searchKeywordInput");
const addKeywordButton = document.getElementById("addKeywordButton");

// 키워드를 담을 배열
let keywords = [];

// 카테고리 동적 생성
const paintCategoryList = async () => {
  const categoryList = await Api.get("/api/category");
  let categoryOptions = `<option value="">카테고리를 선택해 주세요.</option>`;

  categoryList.forEach((category) => {
    categoryOptions += `
      <option
        value=${category.name}
        class="notification is-primary is-light"
      >
        ${category.name}
      </option>
    `;
  });
  categorySelectBox.innerHTML = categoryOptions;
};

// 키워드 추가 함수
// TODO: 키워드 삭제하면 CSS 무너지는 버그 해결 필요
const handleAddKeyword = (e) => {
  e.preventDefault();

  // 입력된 값이 있으면
  if (searchKeywordInput.value !== "") {
    // 키워드 박스 생성 후 추가
    const keywordBox = document.createElement("div");
    keywordBox.classList.add("control");

    keywordBox.innerHTML = `
      <div class="tags has-addons">
        <span class="tag is-link is-light">${searchKeywordInput.value}</span>
        <a id="deleteButton" class="tag is-link is-light is-delete"></a>
      </div>
    `;

    keywordContainer.append(keywordBox);

    const tags = document.querySelectorAll(".tags");

    for (const tag of tags) {
      tag.addEventListener("click", (e) => {
        // 키워드 삭제 시 배열에서 제거하고 태그도 제거
        keywords = keywords.filter(
          (keyword) => keyword !== e.target.previousElementSibling.textContent
        );
        tag.closest(".control").remove();
      });
    }

    // 키워드를 배열에 추가
    keywords.push(searchKeywordInput.value);
    searchKeywordInput.value = "";
    searchKeywordInput.focus();
  }
};

// 제품 등록 요청, /api/product/add
const handleSubmit = async (e) => {
  e.preventDefault();

  const bodyForm = new FormData(registerProductForm);
  bodyForm.append("keyword", keywords);

  await fetch("/api/product/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: bodyForm,
  }).then((res) => {
    if (res.ok) {
      location.reload();
      return alert("상품이 정상적으로 등록되었습니다.");
    }
    location.reload();
    alert("상품 등록에 문제가 발생하였습니다. 다시 시도해주세요.");
  });
};

// 이미지 파일 이름 설정
const handleImageFileName = (e) => {
  const {
    target: { files },
  } = e;

  fileNameSpan.innerText = files[0].name;
};

addKeywordButton.addEventListener("click", handleAddKeyword);
registerProductForm.addEventListener("submit", handleSubmit);
imageInput.addEventListener("change", handleImageFileName);

paintCategoryList();
