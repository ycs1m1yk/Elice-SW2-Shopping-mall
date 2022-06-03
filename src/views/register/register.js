import * as Api from "/api.js";
import { validateEmail } from "/useful-functions.js";
import header from "/components/Header.js";

document.body.insertAdjacentElement("afterbegin", header);

// 요소(element), input 혹은 상수
const fullNameInput = document.querySelector("#fullNameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const passwordConfirmInput = document.querySelector("#passwordConfirmInput");
const submitButton = document.querySelector("#submitButton");
const emailConfirmButton = document.getElementById("emailConfirmButton");
const modal = document.getElementById("modal");
const emailConfirmInput = document.getElementById("emailConfirmInput");
const emailSubmitButton = document.getElementById("emailSubmitButton");

let emailConfirmNum;

const addAllEvents = () => {
  submitButton.addEventListener("click", handleSubmit);
  emailConfirmButton.addEventListener("click", handleEmailConfirm);
  emailSubmitButton.addEventListener("click", handleCompleteEmailCheck);
};

const makeEmptyInput = () => {
  fullNameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
  passwordConfirmInput.value = "";
};

// 회원가입 진행
const handleSubmit = async (e) => {
  e.preventDefault();

  const fullName = fullNameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  // 잘 입력했는지 확인
  const isFullNameValid = fullName.length >= 2;
  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length >= 4;
  const isPasswordSame = password === passwordConfirm;

  if (!isFullNameValid || !isPasswordValid) {
    makeEmptyInput();
    fullNameInput.focus();
    return alert("이름은 2글자 이상, 비밀번호는 4글자 이상이어야 합니다.");
  }

  if (!isEmailValid) {
    makeEmptyInput();
    fullNameInput.focus();
    return alert("이메일 형식이 맞지 않습니다.");
  }

  if (!isPasswordSame) {
    makeEmptyInput();
    fullNameInput.focus();
    return alert("비밀번호가 일치하지 않습니다.");
  }

  // 회원가입 api 요청
  try {
    const data = { fullName, email, password };

    await Api.post("/api/register", data);

    alert("정상적으로 회원가입되었습니다.");

    // 로그인 페이지 이동
    window.location.href = "/login";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
};

const handleCompleteEmailCheck = (e) => {
  e.preventDefault();

  if (Number(emailConfirmInput.value) !== emailConfirmNum) {
    alert("인증번호가 일치하지 않습니다. 회원가입을 다시 진행해주세요.");
    location.reload();
  } else {
    alert("인증번호가 일치합니다. 다음 단계로 넘어갑니다.");
    modal.classList.toggle("is-active");
  }
};

const handleEmailConfirm = async (e) => {
  e.preventDefault();
  emailConfirmNum = await Api.post("/api/mail", { email: emailInput.value });
  if (emailConfirmNum) {
    alert("인증번호가 발송되었습니다.");
  }
  modal.classList.add("is-active");
};

addAllEvents();
