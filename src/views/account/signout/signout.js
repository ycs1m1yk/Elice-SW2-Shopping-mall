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
  e.preventDefault();
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
  }).then((res) => {
    // 삭제 완료
    if (res.ok) {
      alert("회원 탈퇴가 정상적으로 이루어졌습니다.");
      window.location.href = "/";
      localStorage.removeItem("token");
      return;
    }

    // 삭제가 안됐을 시 다시 입력할 수 있게끔
    alert("비밀번호를 다시 입력해주세요.");
    window.location.href = "/account/signout";
  });
};

submitButton.addEventListener("click", handleSubmitButtonClick);
modalButton.addEventListener("click", handleModalButtonClick);
