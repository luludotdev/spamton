import { execa } from "execa";
import { env } from "~/env";

export const getVersion: () => Promise<string> = async () => {
  if (env.GIT_SHA) return env.GIT_SHA.slice(0, 7);

  try {
    const { stdout: gitVersion } = await execa("git", [
      "rev-parse",
      "--short",
      "HEAD",
    ]);

    const { stdout: status } = await execa("git", ["status", "-s"]);
    const dev = status !== "";

    return dev ? `${gitVersion} (dev)` : gitVersion;
  } catch (error) {
    console.log(error);
    return "unknown";
  }
};
