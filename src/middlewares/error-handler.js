// 에러 미들웨어는 항상 (설령 안 쓰더라도)
// error~next의 4개 인자를 설정해 주어야 함.
function errorHandler(error, req, res, next) {
  // 터미널에 노란색으로 출력됨.
  console.log("\x1b[33m%s\x1b[0m", error.stack);

  switch (error.message) {
    case "Unauthorized":
      res.status(401).json({ result: "error", reason: error.message });
      break;

    case "Forbidden":
      res.status(404).json({ result: "error", reason: error.message });
      break;

    case "headers의 Content-Type을 application/json으로 설정해주세요":
      res.status(406).json({ result: "error", reason: error.message });
      break;
    default:
      res.status(400).json({ result: "error", reason: error.message });
  }
}

export { errorHandler };
