import "reflect-metadata";

import { exitHook } from "@luludev/exit";
import { env } from "~/env";
import { action, errorField, flush, logger } from "~/logger";

const boot = async () => {
  env.validate();

  const { run } = await import("./bot");
  await run();
};

exitHook(async (exit, error) => {
  if (error) {
    logger.error(errorField(error));
  } else {
    logger.info(action("shutdown"));
  }

  await flush();
  exit();
});

void boot();
