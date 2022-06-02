import is from "@sindresorhus/is";

function contentTypeChecker(body) {
  if (is.emptyObject(body)) {
    throw new Error(
      "headers의 Content-Type을 application/json으로 설정해주세요"
    );
  }
}

export { contentTypeChecker };
