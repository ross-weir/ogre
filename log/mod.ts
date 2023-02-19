import { LoggingConfig } from "../config/mod.ts";
import { log } from "../deps.ts";

/** Setup application logging configuration */
export function setupLogging({ console }: LoggingConfig) {
  return log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(console.level),
    },
    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console"],
      },
    },
  });
}
