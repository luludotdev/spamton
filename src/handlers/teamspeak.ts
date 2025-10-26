import { setInterval } from "node:timers";
import type { ActivitiesOptions, Client } from "discord.js";
import { ActivityType } from "discord.js";
import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { ClientType } from "ts3-nodejs-library";
import { connect } from "~/ts3";

@Discord()
export abstract class TeamSpeak {
  @On({ event: "clientReady" })
  public onReady([client]: ArgsOf<"clientReady">): void {
    setInterval(() => {
      void this.#setStatus(client);
    }, 1_000 * 60);

    void this.#setStatus(client);
  }

  async #setStatus(client: Client): Promise<void> {
    if (!client.user) {
      console.warn("missing client user");
      return;
    }

    await using ts = await connect();
    const clients = await ts.clientList({ clientType: ClientType.Regular });
    const count = clients.length;
    await ts.quit();

    const activities: ActivitiesOptions[] = [];
    if (count === 1) {
      activities.push({
        type: ActivityType.Custom,
        name: `${count} person on TeamSpeak`,
      });
    } else if (count > 1) {
      activities.push({
        type: ActivityType.Custom,
        name: `${count} people on TeamSpeak`,
      });
    }

    client.user.setPresence({ status: "online", activities });
  }
}
