import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { env } from "~/env";
import {
  commandContext as ctxField,
  errorField,
  logger,
  userField,
} from "~/logger";

const context = ctxField("landmine");
const LANDMINE_EXEMPT_CHANNELS = env.LANDMINE_EXEMPT_CHANNELS?.split(",") ?? [];

@Discord()
export abstract class Landmine {
  readonly #TIMEOUT = 5;

  #randomValues = new Uint32Array(32);

  #randomInts: number[] = [];

  readonly #DUDS = new Map<string, number>();

  #rng(): number {
    if (this.#randomInts.length === 0) {
      crypto.getRandomValues(this.#randomValues);
      this.#randomInts.push(...this.#randomValues);
    }

    const [int] = this.#randomInts.splice(0, 1);
    return int! / 2 ** 32;
  }

  @On({ event: "messageCreate" })
  public async onMessage([message]: ArgsOf<"messageCreate">) {
    if (message.author === message.client.user) return;
    if (!message.member) return;
    if (LANDMINE_EXEMPT_CHANNELS.includes(message.channelId)) return;

    const rng = this.#rng() * 3_000;
    const duds = this.#DUDS.get(message.author.id) ?? 1;
    const trigger = rng < duds;

    if (!trigger) {
      this.#DUDS.set(message.author.id, duds + 1);
      return;
    }

    this.#DUDS.delete(message.author.id);

    try {
      if (!message.member.moderatable) {
        await message.reply({
          allowedMentions: { parse: [] },
          content: `‼️ ${message.author} stepped on a landmine, but it was inactive`,
        });
      } else {
        await message.member.timeout(this.#TIMEOUT * 60 * 1_000, "landmine");
        await message.reply({
          allowedMentions: { parse: [] },
          content: `💥 ${message.author} stepped on a landmine and has been timed out for ${this.#TIMEOUT} minute${this.#TIMEOUT > 1 ? "s" : ""}`,
        });
      }

      logger.info({
        ...context,
        action: "trigger",
        user: userField(message.author),
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ ...context, ...errorField(error) });
      }
    }
  }
}
