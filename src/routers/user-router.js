import { Router } from "express";
import { loginRequired } from "../middlewares";
import { userService } from "../services";
import { transPort } from "../config/email";
import { contentTypeChecker } from "../utils/content-type-checker";

const userRouter = Router();

// 내 정보 조회
userRouter.get("/my", loginRequired, async (req, res, next) => {
  try {
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    // db에서 내 정보 가져옴
    let myInfo = await userService.getMyInfo(userId);

    // 내 정보에서 password를 제외하고 front에 전달
    const myInfoWithoutPwd = await userService.exceptPwd(myInfo._doc);
    res.status(200).json(myInfoWithoutPwd);
  } catch (error) {
    next(error);
  }
});

// 내 판매 목록 조회
userRouter.get("/user/sellinglist", loginRequired, async (req, res, next) => {
  try {
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    // db에서 내 판매 목록 가져옴
    const mySellingInfo = await userService.getProductsByUserId(userId);
    // front에 데이터 전달
    res.status(200).json(mySellingInfo);
  } catch (error) {
    next(error);
  }
});

// 회원가입 할때 작성한 이메일로 인증코드가 담긴 메일 전송
userRouter.post("/mail", async (req, res, next) => {
  // Content-Type 체크
  contentTypeChecker(req.body);
  // 인증번호 생성
  let authNum = Math.random().toString().substr(2, 6);
  // nodeMailer 옵션
  const mailOptions = {
    from: "rhakdjfk@ajou.ac.kr",
    to: req.body.email,
    subject: "회원가입을 위해 인증번호를 입력해주세요.",
    text: "인증 코드입니다. " + authNum,
  };
  // 메일 전송
  await transPort.sendMail(mailOptions, function (error, info) {
    console.log(mailOptions);
    if (error) {
      console.log(error);
    }
    // console.log("Finish sending email : " + info.response);
    res.send(authNum);
    transPort.close();
  });
});

// 회원가입
userRouter.post("/register", async (req, res, next) => {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    const { fullName, email, password } = req.body;
    // db에 회원 정보 생성
    const newUser = await userService.addUser({
      fullName,
      email,
      password,
    });

    // front에 데이터 전달
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// 로그인
userRouter.post("/login", async function (req, res, next) {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    const { email, password } = req.body;
    // 로그인 성공시 토큰 생성
    const userToken = await userService.getUserToken({ email, password });
    // front에 토큰 전달
    res.status(200).json(userToken);
  } catch (error) {
    next(error);
  }
});

// 내 정보에 배송지 추가
userRouter.post("/address", loginRequired, async (req, res, next) => {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    const { addressName, postalCode, address1, address2 } = req.body;
    const address = { addressName, postalCode, address1, address2 };
    // db에 내 정보 배송지 추가
    const newAddress = await userService.setUserAddress(userId, address);
    // front에 데이터 전달
    res.status(200).json(newAddress);
  } catch (error) {
    next(error);
  }
});

// 회원 정보 수정
userRouter.put("/user", loginRequired, async function (req, res, next) {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);

    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    const fullName = req.body.fullName;
    const password = req.body.password;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const role = req.body.role;
    // 현재 비밀번호 입력
    const currentPassword = req.body.currentPassword;

    // currentPassword 없을 시, 진행 불가
    if (!currentPassword) {
      throw new Error("정보를 변경하려면, 현재의 비밀번호가 필요합니다.");
    }

    const userInfoRequired = { userId, currentPassword };

    // 업데이트용 객체에 삽입
    const toUpdate = {
      ...(fullName && { fullName }),
      ...(password && { password }),
      ...(address && { address }),
      ...(phoneNumber && { phoneNumber }),
      ...(role && { role }),
    };

    // db에 회원 정보 수정
    const updatedUserInfo = await userService.setUser(
      userInfoRequired,
      toUpdate
    );

    // 내 정보에서 password를 제외하고 front에 전달
    const userInfoWithoutPwd = await userService.exceptPwd(
      updatedUserInfo._doc
    );
    // 업데이트 이후의 유저 데이터를 프론트에 보내 줌
    res.status(200).json(userInfoWithoutPwd);
  } catch (error) {
    next(error);
  }
});

// 회원 탈퇴
userRouter.delete("/user", loginRequired, async function (req, res, next) {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    // 토큰에서 userId 추출
    const userId = req.currentUserId;
    console.log(userId);
    // 현재 비밀번호 입력
    const { currentPassword } = req.body;

    // currentPassword 없을 시, 진행 불가
    if (!currentPassword) {
      throw new Error("회원 탈퇴를 위해, 비밀번호를 입력해주세요.");
    }
    const userInfoRequired = { userId, currentPassword };
    // db에 회원 정보 삭제
    const deleteUserInfo = await userService.deleteUser(userInfoRequired);
    const userInfoWithoutPwd = await userService.exceptPwd(deleteUserInfo._doc);
    // front에 삭제한 회원 정보 전달
    res.status(200).json(userInfoWithoutPwd);
  } catch (error) {
    next(error);
  }
});

// 회원 정보에서 배송지 정보 삭제
userRouter.delete("/address", loginRequired, async (req, res, next) => {
  try {
    // Content-Type 체크
    contentTypeChecker(req.body);
    const { addressName } = req.body;
    // 현재 비밀번호 입력
    const userId = req.currentUserId;
    // db에 회원 정보에서 배송지 정보 삭제
    const deletedUserAddress = await userService.deleteAddress(
      userId,
      addressName
    );
    // front에 데이터 전달
    res.status(200).json(deletedUserAddress);
  } catch (error) {
    next(error);
  }
});

export { userRouter };
