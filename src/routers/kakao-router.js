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
        const exUser = await userService.getMyInfo(profile.id);
        if (exUser) {
          done(null, exUser);
        } else {
          const { provider, id, username } = profile;
          const email = profile._json && profile._json.kakao_account_email;
          if (!email) {
            done("이메일 동의를 해주세요");
          }
          const newUserInfo = {
            provider,
            _id: id,
            fullName: username,
            email,
            password: "kakao",
          };
          const newUser = await userService.addUserKakao(newUserInfo);
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
