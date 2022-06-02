import { decodeJWT, removeToken } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

const registerForm = document.getElementById("registerUserForm");
const modalBox = document.getElementById("modal");
const modalButton = document.getElementById("deleteCompleteButton");
const passwordInput = document.getElementById("passwordInput");

const formData = new FormData();

passwordInput.focus();

const handleSubmit = (e) => {
  e.preventDefault();
  formData.append("password", e.target[0].value);
  // 모달 창 재확인
  modalBox.classList.toggle("is-active");
};

const handleModalButtonClick = async (e) => {
  e.preventDefault();
  console.log(localStorage.getItem("token"));

  await fetch(`/api/user`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      currentPassword: formData.get("password"),
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const errorContent = await res.json();
      const { reason } = errorContent;

      alert(reason);
      localStorage.removeItem("token");
      location.href = "/";

      return;
    }
    alert("회원 정보가 삭제되었습니다.");
    localStorage.removeItem("token");
    window.location.href = "/";
  });
};

registerForm.addEventListener("submit", handleSubmit);
modalButton.addEventListener("click", handleModalButtonClick);
