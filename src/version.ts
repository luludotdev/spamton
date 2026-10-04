import { x } from "tinyexec";
import { env } from "#/env";

export const getVersion: () => Promise<string> = async () => {
  if (env.GIT_SHA !== undefined && env.GIT_SHA !== "") {
    return env.GIT_SHA.slice(0, 7);
  }

  try {
    const { stdout: gitVersion } = await x("git", ["rev-parse", "--short", "HEAD"]);
    const { stdout: status } = await x("git", ["status", "-s"]);
    const dev = status !== "";

    return dev ? `${gitVersion.trim()} (dev)` : gitVersion.trim();
  } catch (error) {
    console.log(error);
    return "unknown";
  }
};
