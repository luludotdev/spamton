export {};

// import {
//   AutocompleteInteraction,
//   CommandInteraction,
//   ApplicationCommandOptionType as OptionType,
// } from "discord.js";
// import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
// import {
//   commandContext as ctxField,
//   errorField,
//   logger,
//   userField,
// } from "~/logger.js";

// const context = ctxField("reminders");

// type ReminderStore =

// @Discord()
// @SlashGroup({ name: "reminders", description: "Manage reminders" })
// export abstract class Reminders {
//   @Slash({
//     name: "remindme",
//     description: "Set a reminder. Requires DMs to be enabled.",
//   })
//   public async remindme(
//     @SlashOption({
//       name: "time",
//       type: OptionType.String,
//       description:
//         "The relative (5 hours) or absolute (5:00PM) UTC time to set for the reminder",
//       required: true,
//     })
//     time: string,
//     @SlashOption({
//       name: "reminder",
//       type: OptionType.String,
//       description: "The reminder to send",
//       required: true,
//     })
//     reminder: string,
//     ctx: CommandInteraction,
//   ) {
//     // TODO
//   }

//   @SlashGroup("reminders")
//   @Slash({ name: "list", description: "Show a list of all pending reminders" })
//   public async listReminders(ctx: CommandInteraction) {
//     // TODO
//   }

//   @SlashGroup("reminders")
//   @Slash({ name: "delete", description: "Deletes a pending reminder" })
//   public async deleteReminder(
//     @SlashOption({
//       name: "reminder",
//       type: OptionType.String,
//       description: 'The ID of the reminder from "/reminders list"',
//       required: true,
//       autocomplete: true,
//     })
//     id: string,
//     ctx: AutocompleteInteraction | CommandInteraction,
//   ) {
//     if (ctx instanceof AutocompleteInteraction) {
//       // TODO
//     }
//     // TODO
//   }
// }
