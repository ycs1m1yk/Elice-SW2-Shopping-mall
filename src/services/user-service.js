import { userModel } from "../db";
import { productModel } from "../db";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserService {
  // 본 파일의 맨 아래에서, new UserService(userModel) 하면, 이 함수의 인자로 전달됨
  constructor(userModel, productModel) {
    this.userModel = userModel;
    this.productModel = productModel;
  }
  // 카카오 회원가입
  async addUserKakao(newUserInfo) {
    return await this.userModel.create(newUserInfo);
  }

  // 회원가입
  async addUser(userInfo) {
    // 객체 destructuring
    const { email, fullName, password } = userInfo;
    if (!email || !fullName || !password) {
      throw new Error("Need All Elements in body");
    }
    // 이메일 중복 확인
    const user = await this.userModel.findByEmail(email);

    if (user) {
      throw new Error(
        "이 이메일은 현재 사용중입니다. 다른 이메일을 입력해 주세요."
      );
    }

    // 이메일 중복은 이제 아니므로, 회원가입을 진행함

    // 우선 비밀번호 해쉬화(암호화)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInfo = { fullName, email, password: hashedPassword };

    // db에 저장
    return await this.userModel.create(newUserInfo);
  }

  // 로그인
  async getUserToken(loginInfo) {
    // 객체 destructuring
    const { email, password } = loginInfo;
    if (!email || !password) {
      throw new Error("Need All Elements in body");
    }
    // 우선 해당 이메일의 사용자 정보가  db에 존재하는지 확인
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new Error(
        "해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요."
      );
    }

    // 이제 이메일은 문제 없는 경우이므로, 비밀번호를 확인함

    // 비밀번호 일치 여부 확인
    const correctPasswordHash = user.password; // db에 저장되어 있는 암호화된 비밀번호

    // 매개변수의 순서 중요 (1번째는 프론트가 보내온 비밀번호, 2번쨰는 db에 있떤 암호화된 비밀번호)
    const isPasswordCorrect = await bcrypt.compare(
      password,
      correctPasswordHash
    );

    if (!isPasswordCorrect) {
      throw new Error(
        "비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요."
      );
    }

    // 로그인 성공 -> JWT 웹 토큰 생성
    const secretKey = process.env.JWT_SECRET_KEY || "secret-key";

    // 2개 프로퍼티를 jwt 토큰에 담음
    const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
      expiresIn: "1h", // token 1시간 뒤  만료
    });

    return { token };
  }

  async getMyInfo(userId) {
    if (!userId) {
      throw new Error("Need to login");
    }
    return await userModel.findById(userId);
  }
  async setUserAddress(userId, address) {
    if (!userId || !address) {
      throw new Error("Need to All");
    }
    const toUpdate = { address };
    const user = await this.userModel.update({
      userId,
      update: toUpdate,
    });
    return user;
  }
  // 유저정보 수정, 현재 비밀번호가 있어야 수정 가능함.
  async setUser(userInfoRequired, toUpdate) {
    // 객체 destructuring
    const { userId, currentPassword } = userInfoRequired;
    const { fullName, password, address, phoneNumber, role } = toUpdate;
    if (!fullName || !password || !address || !phoneNumber || !role) {
      throw new Error("Need All Elements in body");
    }
    // 기본 코드 수정. 유저 정보 존재 확인 및 비밀번호 검증 메소드
    await this.userVerify(userId, currentPassword);

    // 이제 드디어 업데이트 시작

    // 비밀번호도 변경하는 경우에는, 회원가입 때처럼 해쉬화 해주어야 함.

    if (password) {
      const newPasswordHash = await bcrypt.hash(password, 10);
      toUpdate.password = newPasswordHash;
    }

    // 업데이트 진행
    const user = await this.userModel.update({
      userId,
      update: toUpdate,
    });

    return user;
  }

  async deleteUser(userInfoRequired) {
    const { userId, currentPassword } = userInfoRequired;

    // 기본 코드 수정. 유저 정보 존재 확인 및 비밀번호 검증 메소드
    await this.userVerify(userId, currentPassword);

    return await this.userModel.deleteById(userId);
  }

  async userVerify(userId, currentPassword) {
    // 우선 해당 id의 유저가 db에 있는지 확인
    let user = await this.userModel.findById(userId);

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      throw new Error("가입 내역이 없습니다. 다시 한 번 확인해 주세요.");
    }

    // 이제, 정보 수정을 위해 사용자가 입력한 비밀번호가 올바른 값인지 확인해야 함

    // 비밀번호 일치 여부 확인
    const correctPasswordHash = user.password;

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      correctPasswordHash
    );

    if (!isPasswordCorrect) {
      throw new Error(
        "현재 비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요."
      );
    }
  }

  async exceptPwd(userInfo) {
    return (({ password, ...o }) => o)(userInfo);
  }

  //유저별 판매 목록 조회
  async getProductsByUserId(userId) {
    return await this.productModel.findByUserId(userId);
  }
}

export const userService = new UserService(userModel, productModel);
