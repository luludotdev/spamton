import { env } from "#/env";
import "./avatar";
import "./checkmines";
import "./repo";

if (env.TEAMSPEAK_URI !== undefined) {
  await import("./teamspeak");
}
