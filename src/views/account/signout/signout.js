import { decodeJWT } from "/useful-functions.js";

const submitButton = document.getElementById("submitButton");
const modalBox = document.getElementById("modal");
const modalButton = document.getElementById("deleteCompleteButton");
let password = ""; // 현재 비밀번호

const handleSubmitButtonClick = (e) => {
  e.preventDefault();
  password = e.target.form[0].value;
  // 모달 창 재확인
  modalBox.classList.toggle("is-active");
};

const handleModalButtonClick = async (e) => {
  const token = localStorage.getItem("token");
  const payload = decodeJWT(token);
  const userId = payload.userId;

  // console.log(userId);
  // console.log(password);

  await fetch(`/api/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      currentPassword: password,
    }),
  }).then((response) => {
    console.log(response);
    if (!response.ok) {
      throw new Error("네트워크 응답이 올바르지 않습니다.");
    }
    localStorage.removeItem("token");
    window.location.href = "/";
  });
};

submitButton.addEventListener("click", handleSubmitButtonClick);
modalButton.addEventListener("click", handleModalButtonClick);
