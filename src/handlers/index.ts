import { env } from "~/env";

import "./landmine";

if (env.TEAMSPEAK_URI) {
  await import("./teamspeak");
}
