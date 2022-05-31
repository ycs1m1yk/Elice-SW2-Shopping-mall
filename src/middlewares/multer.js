import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
//aws.config.loadFromPath(__dirname + "/../config/s3.json");
aws.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "product-image-team21",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});
export { upload };
