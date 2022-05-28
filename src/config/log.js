import fs from "fs";
import appRoot from "app-root-path";

const accessLogStream = fs.createWriteStream(`${appRoot}/src/log/access.log`, {
  flags: "a",
});

export { accessLogStream };
