import { env } from "~/env";

import "./avatar.js";
import "./pin.js";
import "./reminders.js";
import "./repo.js";

if (env.TEAMSPEAK_URI) {
  await import("./teamspeak.js");
}
