import { env } from "~/env";

if (env.TEAMSPEAK_URI) {
  await import("./teamspeak.js");
}
