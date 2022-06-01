import header from "/components/Header.js";
import * as Api from "/api.js";
import { getToken } from "/useful-functions.js";

document.body.insertAdjacentElement("afterbegin", header);

const totalUsersCount = document.getElementById("totalUsersCount");
const basicUsersCount = document.getElementById("basicUsersCount");
const sellerUsersCount = document.getElementById("sellerUsersCount");
const adminUserCount = document.getElementById("adminUserCount");
const usersContainer = document.getElementById("usersContainer");

// 총 유저 수, 관리자 수, 소셜 로그인 가입자 수를 보여주는 Nav Bar
const paintNavBar = (users) => {
  const { admin: adminCount, seller: sellerCount } = users.reduce(
    (result, user) => {
      return Object.assign(result, {
        [user.role]: (result[user.role] || 0) + 1,
      });
    },
    { admin: 0, seller: 0 }
  );

  totalUsersCount.innerText = users.length;
  basicUsersCount.innerText = users.length - adminCount - sellerCount;
  adminUserCount.innerText = adminCount;
  sellerUsersCount.innerText = sellerCount;
};

// 전체 유저 리스트
const paintUserList = (users) => {
  users.forEach((user) => {
    let userRole; // 해당 유저의 권한
    let selectedRole; // default 권한 표시
    let userInfo = document.createElement("div");
    userInfo.classList.add("columns");
    userInfo.classList.add("orders-item");
    userInfo.setAttribute("data-email", user.email);

    // 권한에 따라 다르게 설정 - TODO: 반복되는 코드 리팩토링
    if (user.role === "user") {
      userRole = "일반";
      selectedRole = `
      <select
        id="roleSelectBox"
        name="role"
        class="has-background-link-light has-text-link"
      >
        <option
        class="has-background-link-light has-text-link"
        value="user"
        selected
        >
        일반사용자
        </option>
        <option
        class="has-background-link-light has-text-link"
        value="seller"
        >
          판매자
        </option>
        <option
        class="has-background-danger-light has-text-danger"
        value="admin"
        >
          관리자
        </option>
      </select>
      `;
    } else if (user.role === "seller") {
      userRole = "판매자";
      selectedRole = `
      <select
        id="roleSelectBox"
        name="role"
        class="has-background-success-light has-text-success"
      >
        <option
        class="has-background-link-light has-text-link"
        value="user"
        >
        일반사용자
        </option>
        <option
        class="has-background-link-light has-text-link"
        value="seller"
        selected
        >
          판매자
        </option>
        <option
        class="has-background-danger-light has-text-danger"
        value="admin"
        >
          관리자
        </option>
      </select>
      `;
    } else if (user.role === "admin") {
      userRole = "관리자";
      selectedRole = `
      <select
        id="roleSelectBox"
        name="role"
        class="has-background-danger-light has-text-danger"
      >
        <option
        class="has-background-link-light has-text-link"
        value="user"
        >
        일반사용자
        </option>
        <option
        class="has-background-link-light has-text-link"
        value="seller"
        >
          판매자
        </option>
        <option
        class="has-background-danger-light has-text-danger"
        value="admin"
        selected
        >
          관리자
        </option>
      </select>
      `;
    }

    userInfo.innerHTML = `
      <div class="column is-2">${user.createdAt.substring(0, 10)}</div>
      <div class="column is-2">${user.email}</div>
      <div class="column is-2">
        <span class="tag">${userRole}</span>
      </div>
      <div class="column is-2">${user.fullName}</div>
      <div class="column is-2">
        <div class="select">
          ${selectedRole}
        </div>
      </div>
      <div class="column is-2">
        <button class="button" id="deleteButton">
          회원정보 삭제
        </button>
      </div>
      </div>
    `;
    usersContainer.appendChild(userInfo);

    const deleteButtons = document.querySelectorAll("#deleteButton");
    const roleSelectBox = document.querySelectorAll("#roleSelectBox");

    // 회원 삭제 버튼 이벤트 추가
    for (const deleteButton of deleteButtons) {
      deleteButton.addEventListener("click", handleClick);
    }

    // 유저 권한 변경 이벤트 추가
    for (const roleBox of roleSelectBox) {
      roleBox.addEventListener("change", handleAuthChange);
    }
  });
};

// 회원 정보 삭제 클릭 시 삭제 요청, /api/admin/users/:email
const handleClick = async (e) => {
  e.preventDefault();

  if (confirm("정말 삭제하시겠습니까?")) {
    const email = e.target.closest(".orders-item").dataset.email; //// 현재 선택한 행(유저)의 이메일
    await fetch(`/api/admin/user/${email}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }).then((res) => {
      if (res.ok) {
        location.reload();
        return alert("회원 정보가 성공적으로 삭제되었습니다.");
      }
      location.reload();
      alert("회원 정보 삭제에 문제가 발생했습니다. 다시 시도해주십시오.");
    });
    e.target.removeEventListener("click", handleClick);
  }
};

// 관리자 권한 변경되면 즉시 권한 변경 요청, /api/admin/user/:email
const handleAuthChange = async (e) => {
  const changedAuth = e.target.options[e.target.selectedIndex].value; // 변경 후 권한
  const email = e.target.closest(".orders-item").dataset.email; // 현재 선택한 행(유저)의 이메일

  await fetch(`/api/admin/user/${email}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      role: changedAuth,
    }),
  }).then((res) => {
    if (res.ok) {
      location.reload();
      return alert("회원 정보가 성공적으로 변경되었습니다.");
    }
    location.reload();
    alert("권한 변경 과정에서 오류가 발생하였습니다. 다시 시도해주십시오.");
  });
};

// 데이터 받아와서 화면에 그리기
const getDataFromApi = async () => {
  const users = await Api.get("/api/admin/users");

  paintNavBar(users);
  paintUserList(users);
};

getDataFromApi();
