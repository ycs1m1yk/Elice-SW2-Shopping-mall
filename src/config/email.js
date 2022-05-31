import nodemailer from "nodemailer";
import "dotenv/config";

export const transPort = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail=.com",
  port: 587,
  secure: false,
  auth: {
    // user: "rhakdjfk@ajou.ac.kr",
    // pass: "tls960505~",
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});
