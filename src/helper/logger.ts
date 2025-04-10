import { createLogger, format, transports } from "winston";

import DailyRotateFile from "winston-daily-rotate-file";

export class ApiLogger {
  private static logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
          ),
          format.simple()
        ),
      }),
      new DailyRotateFile({
        level: process.env.LOG_LEVEL || "info",
        datePattern: "DD-MM-YYYY",
        dirname: "./logs",
        filename: "logs-%DATE%.log",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
      }),
    ],
  });

  public static getLogger() {
    return this.logger;
  }
}

export default ApiLogger.getLogger();
