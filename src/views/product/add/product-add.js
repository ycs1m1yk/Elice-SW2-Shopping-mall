import header from "/components/Header.js";
import { decodeJWT } from "/useful-functions.js";
import * as Api from "/api.js";

document.body.insertAdjacentElement("afterbegin", header);

const registerProductForm = document.getElementById("registerProductForm");
const keywordContainer = document.getElementById("keywordContainer");
const categorySelectBox = document.getElementById("categorySelectBox");

const imageInput = document.getElementById("imageInput");
const addKeywordButton = document.getElementById("addKeywordButton");
const searchKeywordInput = document.getElementById("searchKeywordInput");
const titleInput = document.getElementById("titleInput");
const manufacturerInput = document.getElementById("manufacturerInput");
const shortDescriptionInput = document.getElementById("shortDescriptionInput");
const detailDescriptionInput = document.getElementById(
  "detailDescriptionInput"
);
const inventoryInput = document.getElementById("inventoryInput");
const priceInput = document.getElementById("priceInput");
const contentTitle = document.getElementById("content-title");
const contentSubtitle = document.getElementById("content-subtitle");
const submitButton = document.getElementById("submitButton");

const url = new URL(location.href).searchParams;
const productId = url.get("product");
// 키워드를 담을 배열
let keywords = [];

// 제품 수정일 경우 화면 구성

const showPastKeyword = (pastKeywords) => {
  // 기존의 키워드 화면에 보여주기
  pastKeywords.forEach((userTag) => {
    const keywordBox = document.createElement("div");
    keywordBox.classList.add("control");
    keywordBox.innerHTML = `
    <div class="tags has-addons">
      <span class="tag is-link is-light">${userTag}</span>
      <a id="deleteButton" class="tag is-link is-light is-delete"></a>
    </div>
  `;

    keywordContainer.append(keywordBox);

    const tags = document.querySelectorAll(".tags");

    for (const tag of tags) {
      tag.addEventListener("click", (e) => {
        // 키워드 삭제 시 배열에서 제거하고 태그도 제거
        keywords = pastKeywords.filter(
          (keyword) => keyword !== e.target.previousElementSibling.textContent
        );
        tag.closest(".control").remove();
      });
    }
  });

  // 키워드를 배열에 추가
};
const editProduct = async () => {
  const productInfo = await Api.get(`/api/product/${productId}`);

  // 상품 수정하기 화면 처리
  titleInput.value = productInfo.name;
  manufacturerInput.value = productInfo.brandName;
  shortDescriptionInput.value = productInfo.shortDescription;
  detailDescriptionInput.value = productInfo.detailDescription;
  inventoryInput.value = productInfo.quantity;
  priceInput.value = productInfo.price;

  contentTitle.innerText = "제품 수정";
  contentSubtitle.innerText = "제품을 수정해보세요";
  submitButton.innerText = "제품 수정하기";

  keywords = productInfo.keyword;
  showPastKeyword(keywords);
};

// 상품 아이디가 URL에 존재하면 상품 수정 프로세스 없다면 상품 추가 프로세스
if (productId) {
  editProduct();
}

// API 요청 함수화
const request = async (role, req, formData) => {
  let apiUrl;

  if (role === "admin") {
    if (req === "POST") {
      apiUrl = `/api/admin/product/add`;
    } else if (req === "PUT") {
      apiUrl = `/api/admin/product/${productId}`;
    }
  } else if (role === "seller") {
    if (req === "POST") {
      apiUrl = `/api/product/add`;
    } else if (req === "PUT") {
      apiUrl = `/api/product/${productId}/update`;
    }
  }

  // 상품 추가 또는 수정 요청
  await fetch(`${apiUrl}`, {
    method: req,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const errorContent = await res.json();
      const { reason } = errorContent;

      alert(reason);
      location.href = "#";
      return;
    }
    alert("상품 등록이 정상적으로 이루어졌습니다.");
    location.reload();
  });
};

// 카테고리 동적 생성
const paintCategoryList = async () => {
  const categoryList = await Api.get("/api/category");
  let categoryOptions = '<option value="">카테고리를 선택해 주세요.</option>';

  categoryList.forEach((category) => {
    categoryOptions += `
      <option
        value="${category.name}"
        class="notification is-primary is-light"
      >
        ${category.name}
      </option>
    `;
  });
  categorySelectBox.innerHTML = categoryOptions;
};

// 키워드 추가 함수
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

// 이미지 파일 이름 설정
const handleImageFileName = (e) => {
  const {
    target: { files },
  } = e;

  fileNameSpan.innerText = files[0].name;
};

// 제품 등록 또는 수정 요청, /api/product/add or /api/product/:id/update
const handleSubmit = async (e) => {
  e.preventDefault();

  const bodyForm = new FormData(registerProductForm);
  bodyForm.append("keyword", keywords);
  const role = decodeJWT(localStorage.getItem("token")).role;

  productId ? request(role, "PUT", bodyForm) : request(role, "POST", bodyForm);
};

addKeywordButton.addEventListener("click", handleAddKeyword);
registerProductForm.addEventListener("submit", handleSubmit);
imageInput.addEventListener("change", handleImageFileName);

paintCategoryList();
