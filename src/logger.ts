import {
  createConsoleSink,
  createFileSink,
  createLogger,
} from "@luludev/jogger";
import type { Data, Primitive } from "@luludev/jogger";
import { ChannelType, PartialGroupDMChannel, User } from "discord.js";
import type { Channel, GuildMember, PartialRecipient, Role } from "discord.js";
import { env, IS_DEV } from "~/env.js";

const consoleSink = createConsoleSink({
  debug: IS_DEV,
});

const fileSink = createFileSink({
  name: "bot",
  directory: "logs",
  debug: env.DEBUG_LOGS ?? IS_DEV,
  rollEveryDay: true,
});

export const logger = createLogger({
  name: "bot",
  sink: [consoleSink, fileSink],
});

export const createField =
  (name: string) =>
  (value: string): Data => ({ [name]: value });

export const action = createField("action");
export const message = createField("message");

export const rootContext = (context: string): Data => ({ context });
export const commandContext = (context: string): Data => ({
  type: "command",
  ...rootContext(context),
});

export const handlerContext = (context: string): Data => ({
  type: "handler",
  ...rootContext(context),
});

export const errorField = <T extends Error>(error: T): Data => {
  const fields: Primitive = { type: error.name, message: error.message };
  const all: Primitive = error.stack
    ? { ...fields, stack: error.stack }
    : fields;

  return { error: all };
};

export const userField: (
  user: GuildMember | PartialRecipient | User,
) => Primitive = (userLike) => {
  if (!("id" in userLike)) {
    return { id: "unknown", username: userLike.username };
  }

  const user = userLike instanceof User ? userLike : userLike.user;
  return { id: user.id, username: user.username };
};

export const channelField = (channel: Channel): Primitive => {
  const channelType = ChannelType[channel.type] ?? "unknown";
  const data: Primitive = {
    id: channel.id,
    type: channelType,
  };

  if (channel.isDMBased()) {
    if (channel instanceof PartialGroupDMChannel) {
      return {
        ...data,
        recipients: channel.recipients.map((user) => userField(user)),
      };
    }

    return { ...data, recipient: userField(channel.recipient!) };
  }

  if (channel.isVoiceBased()) {
    return { ...data, name: channel.name };
  }

  if (channel.isThread()) {
    return {
      ...data,
      name: `#${channel.name}`,
      parent: channelField(channel.parent!),
    };
  }

  return { ...data, name: `#${channel.name}` };
};

export const roleField = (role: Role): Primitive => ({
  id: role.id,
  name: role.name,
});

export const flush = async () => fileSink.flush();
