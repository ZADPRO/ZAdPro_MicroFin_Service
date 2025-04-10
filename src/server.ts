"use strict";

const Hapi = require("@hapi/hapi");
import logger from "./helper/logger";

import Router from "./routes";

import * as DotEnv from "dotenv";

const init = async () => {
  try {
    DotEnv.config();

    const server = Hapi.server({
      host: process.env.HOST || "localhost",
      port: process.env.PORT || 6201,
      routes: {
        cors: {
          origin: ["*"],
          headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
          exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
          credentials: true,
        },
        security: true,
        payload: {
          maxBytes: 5242880,
        },
      },
    });

    await Router.loadRoutes(server);

    await server.start((error: any) => {
      if (error) {
        logger.error(error);
        throw error;
      }
    });
    logger.info("Server running --- from server.ts", process.env.PORT);
  } catch (error) {
    logger.error("Server not running --- ", error);
  }
};

process.on("unhandledRejection", (err) => {
  console.log("Error", err);
  process.exit(1);
});

init();
