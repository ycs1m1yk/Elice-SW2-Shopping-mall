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
  const token = localStorage.getItem("token");

  await fetch("/api/user", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      currentPassword: formData.get("password"),
    }),
  }).then((res) => {
    // 삭제 완료
    if (res.ok) {
      alert("회원 탈퇴가 정상적으로 이루어졌습니다.");
      window.location.href = "/";
      removeToken();
      return;
    }

    // 삭제가 안됐을 시 다시 입력할 수 있게끔
    alert("비밀번호를 다시 입력해주세요.");
    window.location.href = "/account/signout";
  });
};

registerForm.addEventListener("submit", handleSubmit);
modalButton.addEventListener("click", handleModalButtonClick);
