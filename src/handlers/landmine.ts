import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import {
  commandContext as ctxField,
  errorField,
  logger,
  userField,
} from "~/logger.js";

const context = ctxField("landmine");

@Discord()
export abstract class Landmine {
  readonly #PERCENTAGE = 1;

  readonly #TIMEOUT = 5;

  #randomValues = new Uint32Array(32);

  #randomInts: number[] = [];

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
    if (!message.member) return;
    if (!message.member.moderatable) return;

    const rng = this.#rng();
    if (rng > this.#PERCENTAGE / 100) return;

    try {
      await message.member.timeout(this.#TIMEOUT * 60 * 1_000, "landmine");
      await message.reply({
        allowedMentions: { parse: [] },
        content: `💥 ${message.author} stepped on a landmine and has been timed out for ${this.#TIMEOUT} minute${this.#TIMEOUT > 1 ? "s" : ""}`,
      });

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
