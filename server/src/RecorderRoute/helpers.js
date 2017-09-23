import {
  readdir,
  readFile,
  exists,
  mkdir,
  writeFile,
  statSync,
} from "fs-promise";
import mkdirp from "mkdirp-promise";
import { join } from "path";
import uuid from "uuid/v4";
import moment from "moment";

export const findFileById = (path, id = null) =>
  readdir(path).then(files => {
    const name =
      files.filter(file => statSync(file).isDirectory()).find(f => f === id) ||
      files[0];
    return name
      ? readFile(join(path, name), "utf-8")
      : Promise.reject('{"message":"invalid path"}');
  });

export const createNewPathDir = path => {
  return mkdirp(path);
};

export const writeResponseToMocks = (path, data) =>
  writeFile(join(path, moment().format("x")), data, {});
