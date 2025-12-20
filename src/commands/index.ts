import { env } from "~/env";

import "./avatar.js";
import "./repo.js";

if (env.TEAMSPEAK_URI) {
  await import("./teamspeak.js");
}
