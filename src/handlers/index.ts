import { env } from "#/env";
import "./landmine";

if (env.TEAMSPEAK_URI !== undefined) {
  await import("./teamspeak");
}
