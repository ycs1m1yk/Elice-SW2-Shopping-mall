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

  //유저별 판매 목록 조회
  async getProductsByUserId(userId) {
    const products = await this.productModel.findByUserId(userId);
    if (!products) {
      throw new Error("판매 목록을 조회할 수 없습니다.");
    }
    return products;
  }

  // 회원가입
  async addUser(userInfo) {
    const { email, fullName, password } = userInfo;
    if (!email || !fullName || !password) {
      throw new Error("모든 정보를 입력해 주세요.");
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

    // db에 새로운 회원 정보 저장
    const newUser = await this.userModel.create(newUserInfo);
    if (!newUser) {
      throw new Error("회원가입이 정상적으로 처리되지 않았습니다.");
    }
    return newUser;
  }

  // 로그인 및 토큰 발급
  async getUserToken(loginInfo) {
    const { email, password } = loginInfo;
    if (!email || !password) {
      throw new Error("이메일 혹은 비밀번호를 입력해 주세요.");
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

    // userId와 role (일반 회원, 판매자, 관리자)을 토큰에 담아 발급한다.
    const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
      expiresIn: "1h", // token 1시간 뒤  만료
    });

    if (!token) {
      throw new Error("토큰이 정상적으로 발급되지 않았습니다.");
    }

    return { token };
  }

  // 내 정보 보기
  async getMyInfo(userId) {
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }
    const my = await userModel.findById(userId);
    if (!my) {
      throw new Error("회원 정보를 불러올 수 없습니다.");
    }
    return my;
  }

  // 회원 정보 수정.
  async setUser(userInfoRequired, toUpdate) {
    const { userId, currentPassword } = userInfoRequired;
    const { fullName, password, address, phoneNumber, role } = toUpdate;
    if (!fullName || !password || !address || !phoneNumber || !role) {
      throw new Error("모든 정보를 입력해 주세요.");
    }
    // 기본 코드 수정. 유저 정보 존재 확인 및 비밀번호 검증 메소드
    await this.userVerify(userId, currentPassword);

    if (password) {
      const newPasswordHash = await bcrypt.hash(password, 10);
      toUpdate.password = newPasswordHash;
    }

    // 업데이트 진행
    const user = await this.userModel.update({
      userId,
      update: toUpdate,
    });

    if (!user) {
      throw new Error("회원 정보 수정이 정상적으로 처리되지 않았습니다.");
    }

    return user;
  }

  // 회원 정보에 배송지 추가
  async setUserAddress(userId, address) {
    const { addressName, postalCode, address1, address2 } = address;
    if (!addressName || !postalCode || !address1 || !address2) {
      throw new Error("주소를 전부 입력해 주세요.");
    }
    const userInfo = await this.userModel.findById(userId);
    if (!userInfo) {
      throw new Error("없는 사용자 입니다.");
    }
    const newAddressArray = [{ addressName, postalCode, address1, address2 }];
    const addressUpdate = { $push: { address: newAddressArray } };
    const updatedUser = await this.userModel.update({
      userId,
      update: addressUpdate,
    });
    if (!updatedUser) {
      throw new Error("배송지가 정상적으로 추가되지 않았습니다.");
    }
    return updatedUser;
  }

  // 회원 탈퇴
  async deleteUser(userInfoRequired) {
    const { userId, currentPassword } = userInfoRequired;

    if (!userId || !currentPassword) {
      throw new Error("현재 비밀번호를 입력해 주세요.");
    }
    // 기본 코드 수정. 유저 정보 존재 확인 및 비밀번호 검증 메소드
    await this.userVerify(userId, currentPassword);

    const deletedUser = await this.userModel.deleteById(userId);
    if (!deletedUser) {
      throw new Error("회원 탈퇴가 정상적으로 처리되지 않았습니다.");
    }
    return deletedUser;
  }

  // 회원 정보에서 배송지 삭제
  async deleteAddress(userId, addressName) {
    const userInfo = await this.getMyInfo(userId);
    if (!userInfo) {
      throw new Error("해당 회원 정보가 없습니다.");
    }
    if (!addressName) {
      throw new Error("삭제할 주소가 없습니다.");
    }
    const newDelete = await userInfo.address.filter(
      (e) => e.addressName !== addressName
    );
    const deleteUpdate = { $set: { address: newDelete } };
    const deletedUserAddress = await this.userModel.update({
      userId,
      update: deleteUpdate,
    });
    if (!deletedUserAddress) {
      throw new Error("주소가 정상적으로 삭제되지 않았습니다.");
    }
    return deletedUserAddress;
  }

  // 유저 정보 존재 확인 및 비밀번호 검증 메소드
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
    return await (({ password, ...o }) => o)(userInfo);
  }
}

export const userService = new UserService(userModel, productModel);
