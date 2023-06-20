import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionResolvable, SlashCommandSubcommandBuilder } from "discord.js";

export default interface Command {
    name: string;
    builder: SlashCommandSubcommandBuilder;
    executor(interaction: ChatInputCommandInteraction);
    autoComplete?(interaction: AutocompleteInteraction);
    permissions?: PermissionResolvable;
    ephemeral?: boolean;
}