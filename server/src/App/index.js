import express from "express";
import { RouteConfig } from "../RecorderRoute";
import { join } from "path";
import cookieParser from "cookie-parser";

export const provideServer = (routes, config) => {
  const newRoute = RouteConfig({
    proxyPath: "https://ete-eservice.libertymutual.com",
    mocksDir: join(process.env.PWD, "mocks"),
  });
  const app = express();
  app.use(cookieParser());
  app.locals.paths = [];
  routes.forEach(route => route.bind(app));
  app.get("/reset/:path", (req, res) => {
    console.log(req.params.path);
    res.sendStatus(200);
  });
  app.get("/*", (req, res, next) => {
    console.log(req.path);
    let recordedRoute = app.locals.paths[req.path];
    if (recordedRoute) {
      recordedRoute.handler(req, res);
      return;
    }
    newRoute
      .New({ path: req.path })
      .setup(app, req)
      .then(route => {
        // app.use(req.url, route);
        route(req, res);
      });
  });
  return app;
};
