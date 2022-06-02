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
  }).then(async (res) => {
    if (!res.ok) {
      const errorContent = await res.json();
      const { reason } = errorContent;

      alert(reason);
      localStorage.removeItem("token");
      location.href = "/";

      return;
    }
    location.reload();
    alert("카테고리가 정상적으로 추가되었습니다.");
  });
};

const handleUpload = () => {
  fileNameSpan.textContent = imageInput.files[0].name;
};

categoryForm.addEventListener("submit", handleSubmit);
imageInput.addEventListener("change", handleUpload);
