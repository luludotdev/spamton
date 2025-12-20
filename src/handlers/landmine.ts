import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
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
const PERSISTENCE_PATH = "./data/landmines.json";

const isRecordStringNumber = (
  value: unknown,
): value is Record<string, number> => {
  if (typeof value !== "object") return false;
  if (value === null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;

  return Object.getOwnPropertyNames(value).every(
    // @ts-expect-error: record access
    (prop) => typeof value[prop] === "number",
  );
};

@Discord()
export abstract class Landmine {
  // #region instance
  private static _instance: Landmine | undefined;

  public static get instance(): Landmine {
    if (!this._instance) throw new Error("Landmine not instantiated");
    return this._instance;
  }

  public constructor() {
    if (Landmine._instance !== undefined) {
      throw new Error("Landmine already instantiated");
    }

    Landmine._instance = this;

    try {
      // eslint-disable-next-line n/no-sync
      const json = readFileSync(PERSISTENCE_PATH, "utf8");
      const data: unknown = JSON.parse(json);
      if (!isRecordStringNumber(data)) throw new TypeError("invalid");
      this.#DUDS = new Map(Object.entries(data));
    } catch {
      this.#DUDS = new Map();
    }
  }
  // #endregion

  // #region rng
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
  // #endregion

  // #region landmines
  public static readonly RNG_UPPER_BOUND: number = 3_000;

  readonly #DUDS: Map<string, number>;

  public duds(userId: string): number {
    return this.#DUDS.get(userId) ?? 1;
  }

  async #saveDuds(): Promise<void> {
    await mkdir(path.dirname(PERSISTENCE_PATH), { recursive: true });
    await writeFile(
      PERSISTENCE_PATH,
      JSON.stringify(Object.fromEntries(this.#DUDS)),
    );
  }

  public simulate(start: number, runs = 10_000): number {
    const results: number[] = [];
    for (let idx = 0; idx < runs; idx++) {
      results.push(this.#sim(start));
    }

    return results.reduce((a, b) => a + b) / results.length;
  }

  #sim(start: number): number {
    let count = 0;
    let duds = start;

    while (true) {
      count += 1;
      const rng = this.#rng() * Landmine.RNG_UPPER_BOUND;
      const trigger = rng < duds;
      if (trigger) return count;

      duds += 1;
    }
  }
  // #endregion

  // #region event
  readonly #TIMEOUT = 5;

  @On({ event: "messageCreate" })
  public async onMessage([message]: ArgsOf<"messageCreate">) {
    if (message.author === message.client.user) return;
    if (!message.member) return;
    if (LANDMINE_EXEMPT_CHANNELS.includes(message.channelId)) return;

    const rng = this.#rng() * Landmine.RNG_UPPER_BOUND;
    const duds = this.#DUDS.get(message.author.id) ?? 1;
    const trigger = rng < duds;

    if (!trigger) {
      this.#DUDS.set(message.author.id, duds + 1);
      await this.#saveDuds();
      return;
    }

    this.#DUDS.delete(message.author.id);
    await this.#saveDuds();

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
  // #endregion
}
