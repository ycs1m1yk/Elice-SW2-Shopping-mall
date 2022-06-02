import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { userService } from "../services";
import passport from "passport";
import { Strategy } from "passport-kakao";
// const kakaoStrategy = passportKakao.Strategy;
// const kakaoStrategy = require("passport-kakao").Strategy;

const kakaoRouter = Router();

passport.use(
  "kakao",
  new Strategy(
    {
      clientID: process.env.KAKAO_APPKEY,
      callbackURL: process.env.KAKAO_CALLBACKURL, // 카카오에서 설정한 Redirect URI
    },
    async (accessToken, refreshToken, profile, done) => {
      //console.log(profile);
      try {
        const { provider, id, username } = profile;
        const convertedId = "aaaaaaaaaaaaaa" + id;

        const exUser = await userService.getMyInfo(convertedId);
        if (exUser) {
          done(null, exUser);
        } else {
          // const email = profile._json && profile._json.kakao_account_email;
          const email = "test50@test.com";
          if (!email) {
            done("이메일 동의를 해주세요");
          }

          const newUserInfo = {
            provider,
            _id: convertedId,
            fullName: username,
            email,
            password: "kakao",
          };
          console.log(newUserInfo);
          const newUser = await userService.addUserKakao(newUserInfo);
          localStorage.setItem("token", accessToken);
          done(null, newUser);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

kakaoRouter.get("/kakao", passport.authenticate("kakao"));

kakaoRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

// kakaoRouter.

export { kakaoRouter };
