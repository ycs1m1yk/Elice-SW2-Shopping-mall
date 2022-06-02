import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

const categoryForm = document.querySelector("#registerCategoryForm");
const imageInput = document.querySelector("#imageInput");
const fileNameSpan = document.querySelector("#fileNameSpan");

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(categoryForm);

  // 카테고리 추가 요청
  await fetch("/api/category/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  }).then((res) => {
    if (res.ok) {
      location.reload();
      return alert("카테고리가 정상적으로 추가되었습니다.");
    } else {
      location.reload();
      return alert("카테고리 추가에 문제가 발생하였습니다. 다시 시도해주세요.");
    }
  });
};

const handleUpload = () => {
  fileNameSpan.textContent = imageInput.files[0].name;
};

categoryForm.addEventListener("submit", handleSubmit);
imageInput.addEventListener("change", handleUpload);
