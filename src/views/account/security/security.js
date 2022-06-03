import header from "/components/Header.js";
import * as Api from "/api.js";

document.body.insertAdjacentElement("afterbegin", header);

const saveButton = document.getElementById("saveButton"); // 현재 비밀번호 입력받을 모달창 출력
const saveCompleteButton = document.getElementById("saveCompleteButton"); // 클릭 시 PATCH 요청
const securityTitle = document.getElementById("securityTitle");
const fullNameInput = document.getElementById("fullNameInput");
const passwordInput = document.getElementById("passwordInput");
const passwordConfirmInput = document.getElementById("passwordConfirmInput");
const postalCodeInput = document.getElementById("postalCodeInput");
const address1Input = document.getElementById("address1Input");
const address2Input = document.getElementById("address2Input");
const phoneNumberInput = document.getElementById("phoneNumberInput");
const currentPasswordInput = document.getElementById("currentPasswordInput");

// Toggle Button -> 클릭시 해당 Input 활성화
const fullNameToggle = document.getElementById("fullNameToggle");
const passwordToggle = document.getElementById("passwordToggle");
const addressToggle = document.getElementById("addressToggle");
const phoneNumberToggle = document.getElementById("phoneNumberToggle");

const searchAddressButton = document.getElementById("searchAddressButton"); // 다음 주소 찾기 API 호출

let prevUserInfo; // 이전 회원 정보

// 데이터 받아와서 화면 그리기
const paintUserInfo = (userInfo) => {
  securityTitle.innerText = userInfo.email;
  fullNameInput.value = userInfo.fullName;

  // 주소 정보가 있는 경우에만 화면에 표시
  if (userInfo.address[0]) {
    postalCodeInput.value = userInfo.address[0].postalCode;
    address1Input.value = userInfo.address[0].address1;
    address2Input.value = userInfo.address[0].address2;
  }

  // 핸드폰 번호 정보가 있는 경우에만 화면에 표시
  userInfo.phoneNumber
    ? (phoneNumberInput.value = userInfo.phoneNumber)
    : (phoneNumberInput.value = null);
};

const getDataFromApi = async () => {
  prevUserInfo = await Api.get("/api/my");
  paintUserInfo(prevUserInfo);
};

// 다음 주소 찾기 API
const daumAddressAPI = () => {
  return new daum.Postcode({
    oncomplete: function (data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

      // 각 주소의 노출 규칙에 따라 주소를 조합한다.
      // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
      let addr = ""; // 주소 변수
      let extraAddr = ""; // 참고항목 변수

      //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
      if (data.userSelectedType === "R") {
        // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else {
        // 사용자가 지번 주소를 선택했을 경우(J)
        addr = data.jibunAddress;
      }

      // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
      if (data.userSelectedType === "R") {
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
        // 조합된 참고항목을 해당 필드에 넣는다.
        address1Input.value = extraAddr;
      } else {
        address1Input.value = "";
      }

      // 우편번호와 주소 정보를 해당 필드에 넣는다.
      postalCodeInput.value = data.zonecode;
      address1Input.value = addr;

      // 커서를 상세주소 필드로 이동한다.
      address2Input.focus();
    },
  }).open();
};

// Toggle 버튼 제어 함수
const handleToggle = (...rest) => {
  for (const el of rest) {
    el.disabled ? (el.disabled = false) : (el.disabled = true);
  }
  rest[0].focus();
};

const hadleCompleteButton = async (e) => {
  e.preventDefault();

  // 수정된 회원 정보 데이터
  const editUserInfo = {
    ...prevUserInfo,
    fullName: fullNameInput.value,
    password: passwordInput.value,
    phoneNumber: phoneNumberInput.value,
    address: {
      postalCode: postalCodeInput.value,
      address1: address1Input.value,
      address2: address2Input.value,
    },
    currentPassword: currentPasswordInput.value,
  };

  const response = await Api.put("/api/user", editUserInfo); // 회원 정보 수정 요청

  // 회원정보 수정 실패
  if (response.result === "error") {
    return alert(response.reason);
  }

  // 수정 성공 -> 회원 정보 페이지 라우팅 -> 페이지 다시 그리기
  alert("회원 정보가 정상적으로 수정되었습니다.");
  window.location.href = "/account/security";
  paintUserInfo(response);
};

// 저장하기 버튼 클릭 -> 비밀번호 일치 여부 확인 후 모달창 띄우기
const handleSubmit = async (e) => {
  e.preventDefault();
  // 비밀번호 일치하지 않을 시 다시 입력하게끔 유도
  if (passwordInput.value !== passwordConfirmInput.value) {
    passwordInput.focus();
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    return alert("비밀번호가 일치하지 않습니다.");
  }

  // TODO: 써드파티 로그인의 경우 비밀번호 재설정이 불가능하도록 만들기

  document.getElementById("modal").classList.toggle("is-active");
};

// 다음 주소 찾기 API 호출
const handleAddressAPI = (e) => {
  e.preventDefault();
  daumAddressAPI();
};

const handleNameInput = () => {
  handleToggle(fullNameInput);
};

const handlePasswordInput = () => {
  handleToggle(passwordInput, passwordConfirmInput);
};

const handleAddressInput = () => {
  handleToggle(
    postalCodeInput,
    address1Input,
    address2Input,
    searchAddressButton
  );
};

const handlePhoneInput = () => {
  handleToggle(phoneNumberInput);
};

// 이벤트 등록
saveButton.addEventListener("click", handleSubmit);
saveCompleteButton.addEventListener("click", hadleCompleteButton);
fullNameToggle.addEventListener("click", handleNameInput);
passwordToggle.addEventListener("click", handlePasswordInput);
addressToggle.addEventListener("click", handleAddressInput);
phoneNumberToggle.addEventListener("click", handlePhoneInput);
searchAddressButton.addEventListener("click", handleAddressAPI);

getDataFromApi();
