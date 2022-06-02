import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
function contentTypeChecker(body) {
  if (is.emptyObject(body)) {
    throw new Error(
      "headers의 Content-Type을 application/json으로 설정해주세요"
    );
  }
}

export { contentTypeChecker };
