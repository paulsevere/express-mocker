// import request from "request";
import { join } from "path";
import {
  createNewPathDir,
  writeResponseToMocks,
  findFileById,
} from "./helpers";
import url from "url";
import request from "request-promise";
import { readFile } from "fs-promise";
import tough from "tough-cookie";

export const RouteConfig = defaults => {
  return {
    New: config => new RecorderRoute({ record: true, ...defaults, ...config }),
  };
};

export class RecorderRoute {
  constructor(config = { mocksDir: process.env.PWD }) {
    Object.assign(this, config);
    this.mocksPath = join(this.mocksDir, this.path);
    this.handler = this.handler.bind(this);
  }

  handler(req, res) {
    Object.assign(this, this.mapQuery(req.query));
    if (this.record) {
      this.setup(null, req).then(fn => fn(req, res));
    } else {
      res.end(this.data);
    }
  }

  setup = (app, req) => {
    this.cookies = req.cookies;
    this.url = req.url;
    if (app) {
      this.bind(app);
    }
    if (this.record) {
      return this.recordRoute();
    } else {
      if (this.data) {
        return Promise.resolve(this.provideHandler(this.data));
      }
      return this.replayRoute();
    }
  };
  replayRoute = () =>
    findFileById(this.mocksPath)
      .then(data => {
        this.data = data;
        return this.provideHandler(data);
      })
      .catch(() => this.recordRoute());

  recordRoute = () =>
    this.fetchRemote().then(data =>
      createNewPathDir(this.mocksPath).then(() => {
        this.data = data;
        writeResponseToMocks(this.mocksPath, data);
        return this.provideHandler(data);
      }),
    );

  fetchRemote = () => {
    const uri = url.resolve(this.proxyPath, this.url);
    console.log(uri);
    return request
      .get({ uri, headers: { Cookie: this.bindToken() } })
      .then(data => {
        console.log(data);
        this.data = data;
        return data;
      })
      .catch(err => "fucked up");
  };

  bindToken = () => `LtpaToken2=${this.cookies.LtpaToken2}`;

  provideHandler = data => (req, res) => {
    res.end(data);
  };

  bind = app => {
    app.locals.paths[this.path] = this;
  };

  rebind = app => {
    app.use(this.path, this.provideHandler(this.data));
  };
  mapQueryParam = param => {
    if (param === "false") {
      return false;
    } else if (param === "true") {
      return true;
    }
    return param;
  };
  mapQuery = query =>
    Object.keys(query).reduce((acc, item) => {
      acc[item] = this.mapQueryParam(query[item]);
      return acc;
    }, {});
}

export default RecorderRoute;
