import { QueryProtocol, TeamSpeak as TeamSpeakBase } from "ts3-nodejs-library";
import { env } from "~/env";

// #region Connection Info
type TeamSpeakConnectInfo = {
  readonly host: string;
  readonly protocol: TeamSpeakBase.QueryProtocol;
  readonly queryport: number;
  readonly serverport?: number;
  readonly username?: string;
  readonly password?: string;
  readonly nickname?: string;
};

const parseProtocol = (type: string): TeamSpeakBase.QueryProtocol => {
  const lower = type.toLowerCase();
  if (lower === "ssh:") return QueryProtocol.SSH;
  if (lower === "raw:") return QueryProtocol.RAW;

  throw new TypeError(`unsupported protocol: ${type}`);
};

const parseQueryPort = (
  port: string,
  protocol: TeamSpeakBase.QueryProtocol,
): number => {
  if (port === "") {
    return protocol === QueryProtocol.RAW ? 10_011 : 10_022;
  }

  const parsed = Number.parseInt(port, 10);
  if (Number.isNaN(parsed) || parsed > 65_536 || parsed <= 0) {
    throw new TypeError(`invalid port: ${port}`);
  }

  return parsed;
};

const parseServerPort = (port: string | null): number | undefined => {
  if (port === null) return undefined;

  const parsed = Number.parseInt(port, 10);
  if (Number.isNaN(parsed) || parsed > 65_536 || parsed <= 0) {
    throw new TypeError(`invalid port: ${port}`);
  }

  return parsed;
};

const parseConnectionInfo = (uri: URL | string): TeamSpeakConnectInfo => {
  const url = new URL(uri);
  const protocol = parseProtocol(url.protocol);
  const host = url.hostname;
  const queryport = parseQueryPort(url.port, protocol);

  const params = url.searchParams;
  const serverport = parseServerPort(params.get("serverport"));
  const username = params.get("username") ?? undefined;
  const password = params.get("password") ?? undefined;
  const nickname = params.get("nickname") ?? undefined;

  return {
    host,
    protocol,
    queryport,
    serverport,
    username,
    password,
    nickname,
  } as TeamSpeakConnectInfo;
};
// #endregion

// #region Connect
const info = parseConnectionInfo(env.TEAMSPEAK_URI!);
export const connect = async (): Promise<TeamSpeak> => {
  const ts = await TeamSpeakBase.connect(info);

  return Object.assign(ts, {
    async [Symbol.asyncDispose]() {
      await ts.quit();
    },
  });
};

export interface TeamSpeak extends TeamSpeakBase {
  [Symbol.asyncDispose]: () => Promise<void>;
}
// #endregion

// #region User Map
export const parseUsers = (): Map<string, string> => {
  if (!env.TEAMSPEAK_USERS) return new Map();

  const pairs = env.TEAMSPEAK_USERS.split(" ").map(
    (pair) => pair.split(":") as string[],
  );

  const valid = pairs.map((pair) => pair.length === 2).every(Boolean);
  if (!valid) throw new Error("invalid teamspeak users");

  return new Map(pairs as [string, string][]);
};
// #endregion
