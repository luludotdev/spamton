import { env } from "~/env";

import "./landmine.js";

if (env.TEAMSPEAK_URI) {
  await import("./teamspeak.js");
}
