import { decodeJWT, getToken, removeToken } from "/useful-functions.js";

/**
1. 유저
  1) 로그인 되어 있는 경우 - 계정관리, 로그아웃, 카트 - O
  2) 로그인 되어 있지 않은 경우 - 로그인, 회원가입, 카트 - O
  3) 로그인이 되어 있고 계정 관리 탭으로 들어간 경우 - 로그아웃, 카트 - O
  4) 계정 관리 페이지의 메뉴로 접속한 경우 - 계정관리, 로그아웃, 카트  - O
2. 관리자
  1) 로그인 되어 있는 경우 - 페이지관리, 계정관리, 로그아웃, 장바구니 - O
  2) 로그인 되어 있지 않은 경우 - 유저와 동일 - O
  3) 페이지 관리 탭으로 들어간 경우 - 계정관리, 로그아웃, 카트
  4) 페이지 관리 페이지의 메뉴로 접속한 경우 - 페이지관리, 계정관리, 로그아웃, 카트
 */

// 로그인 하지 않았을 때의 헤더
const logoutPageHeader = `
<li><a href="/login">로그인</a></li>
<li><a href="/register">회원가입</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

// 유저가 로그인 했을 때의 헤더
const userHomePageHeader = `
<li><a href="/account">계정관리</a></li>
<li><a class="logout-button" href="">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

// 관리자가 로그인 했을 때의 헤더
const adminHomePageHeader = `
<li><a href="/admin">페이지관리</a></li>
<li><a href="/account">계정관리</a></li>
<li><a class="logout-button" href="">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

const adminPageMenuHeader = `
<li><a href="/account">계정관리</a></li>
<li><a class="logout-button" href="">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

const adminAccountMenuHeader = `
<li><a href="/admin">페이지관리</a></li>
<li><a class="logout-button" href="">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

const adminInsideMenuHeader = `
<li><a href="/admin">페이지관리</a></li>
<li><a href="/account">계정관리</a></li>
<li><a class="logout-button" href="">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

// 유저가 Account Page에 접속했을 때의 헤더
const accoutPageHeader = `
<li><a class="logout-button" href="/">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

// 유저가 Register Page에 접속했을 때의 헤더
const registerPageHeader = `
<li><a href="/login">로그인</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

// Login Page에 접속했을 때의 헤더
const loginPageHeader = `
<li><a href="/register">회원가입</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

// 유저가 Account Page 안의 메뉴에 접속 했을 때의 헤더
const accountPageMenuHeader = `
<li><a href="/account">계정관리</a></li>
<li><a class="logout-button" href="">로그아웃</a></li>
<li>
  <a href="/cart" aria-current="page">
    <span class="icon">
      <i class="fas fa-cart-shopping"></i>
    </span>
    <span>카트</span>
  </a>
</li>
`;

const token = getToken();
const isLogin = token ? true : false; // 토큰이 있으면 true 없으면 false
const isAdmin = token && decodeJWT(token).role === "admin" ? true : false; // 토큰이 있고(로그인이 되어 있고) 권한이 관리자이면 true 일반 유저면 false
const url = new URL(location.href); // 현재 페이지의 url
const pathname = url.pathname; // 현재 url의 pathname, ex) https://example.com/post -> /post

let targetHeader; // 각 페이지에 맞게 설정될 Header

// 로그인 여부 검증
targetHeader = isLogin ? "login" : logoutPageHeader;

// 로그인이 됐다면 일반 유저인지 관리자인지 검증
if (targetHeader == "login") {
  if (isAdmin) {
    targetHeader = adminHomePageHeader;
  } else {
    targetHeader = userHomePageHeader;
  }
}

// 유저가 계정관리 탭에 들어갔는지 검증
if (pathname.split("/")[1] === "account") {
  // 계정 관리 탭 안의 메뉴로 들어간 경우, ex) https://localhost:3000/account/security
  if (pathname.split("/")[2] !== "") {
    targetHeader = accountPageMenuHeader;
  } else {
    targetHeader = accoutPageHeader;
  }
}

// 회원가입 페이지인지 검증
if (pathname.split("/")[1] == "register") {
  targetHeader = registerPageHeader;
}

// 로그인 페이지이지 검증
if (pathname.split("/")[1] == "login") {
  targetHeader = loginPageHeader;
}

if (isAdmin) {
  if (pathname.split("/")[1] === "account") {
    targetHeader = adminAccountMenuHeader;
  } else if (pathname.split("/")[1] === "admin") {
    targetHeader = adminPageMenuHeader;
  } else {
    targetHeader = adminInsideMenuHeader;
  }
}

const header = document.createElement("header");

header.innerHTML = `
<nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="container mt-3">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <img src="/elice-rabbit.png" width="30" height="30" />
            <span class="has-text-link">쇼핑-21팀</span>
          </a>
          <a
            role="button"
            class="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

          <div class="navbar-end breadcrumb my-auto" aria-label="breadcrumbs">
            <ul id="navbar">
              ${targetHeader}
            </ul>
          </div>
        </div>
      </div>
    </nav>
`;

// 로그아웃 버튼 누르면 토큰 삭제하고 홈페이지로 Redirect
const logoutButton = header.querySelector(".logout-button");

const handleLogoutButtonClick = (e) => {
  e.preventDefault();
  removeToken();
  window.location.href = "/";
};

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogoutButtonClick);
}

export default header;
