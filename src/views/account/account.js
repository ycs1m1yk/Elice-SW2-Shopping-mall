import header from "/components/Header.js";
import { getToken, decodeJWT } from "/useful-functions.js";

document.body.insertAdjacentElement("afterbegin", header);

const menuContainer = document.querySelector(".menu-container");
const role = decodeJWT(getToken()).role;

const notUserMenu1 = document.createElement("a");
const notUserMenu2 = document.createElement("a");

// 제품 판매 및 관리 메뉴는 유저는 사용 불가
notUserMenu1.href = "/product/add";
notUserMenu2.href = "/product/edit";
notUserMenu1.classList.add("menu-card");
notUserMenu2.classList.add("menu-card");

notUserMenu1.innerHTML = `<div class="menu-icon">
<span class="icon has-text-info">
  <i class="fa-solid fa-won-sign"></i>
</span>
</div>
<div class="menu-body">
  <p class="title is-3">제품판매</p>
  <p class="subtitle is-5">
    제품 정보를 등록하여, 판매할 수 있습니다.
  </p>
</div>
`;

notUserMenu2.innerHTML = `
<div class="menu-icon">
    <span class="icon has-text-info">
      <i class="fa-solid fa-won-sign"></i>
    </span>
  </div>
  <div class="menu-body">
    <p class="title is-3">제품 관리</p>
    <p class="subtitle is-5">
      제품 정보를 수정 또는 삭제할 수 있습니다.
    </p>
  </div>
`;

if (role === "admin" || role === "seller") {
  menuContainer.append(notUserMenu1, notUserMenu2);
}
