import request from "request";
import { provideServer } from "./src/App";
import { RouteConfig } from "./src/RecorderRoute";
import { findFileById } from "./src/RecorderRoute/helpers";
import { join } from "path";

const newRoute = RouteConfig({
  mocksDir: join(process.env.PWD, "..", "mocks"),
});

const routes = [];

provideServer(routes).listen(8000);
