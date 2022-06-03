function errorHandler(error, req, res, next) {
  // 터미널에 노란색으로 출력됨.
  console.log("\x1b[33m%s\x1b[0m", error.stack);

  // error 메시지에 따른 에러 상태 코드
  switch (error.message) {
    // 401 에러, 로그인 오류
    case "Unauthorized":
      res.status(401).json({ result: "error", reason: error.message });
      break;
    // 403 에러, 사용자가 리소스에 대한 필요 권한 없음
    case "Forbidden":
      res.status(403).json({ result: "error", reason: error.message });
      break;
    // 406 에러
    case "headers의 Content-Type을 application/json으로 설정해주세요":
      res.status(406).json({ result: "error", reason: error.message });
      break;
    // default는 400 에러로 설정
    default:
      res.status(400).json({ result: "error", reason: error.message });
  }
}

export { errorHandler };
