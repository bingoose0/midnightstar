import { Client, GatewayIntentBits, IntentsBitField, REST, Routes, SlashCommandBuilder } from "discord.js";
import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as fs from "fs";

import { Logger } from "./util/Logger";
import Module from "./Module";

dotenv.config();

const token = process.env.TOKEN || "missing_token"
const mongoUrl = process.env.MONGO || "missing_url"

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildEmojisAndStickers] });
client.login(process.env.TOKEN);

const modules = new Array<Module>();
const commands = new Array<SlashCommandBuilder>();

const rest = new REST({ version: "10" }).setToken(token);
const logger = new Logger("Main");

client.once("ready", async (client: Client<true>) => {
    logger.info("Ready called, loading modules...");

    const moduleFiles = fs.readdirSync("src/modules").map(f => {
        if(f.endsWith(".ts")) return f;
    })

    for(const key in moduleFiles) {
        const name = moduleFiles[key];
        const mod = await import(`./modules/${name}`);
        const module = new mod.default();

        if(!(module instanceof Module)) return;

        module.initialize(client);
        modules.push(module);
        commands.push(module.createCommand());

        logger.debug("Loaded module", module.name);
    }

    logger.debug("All modules loaded, registering commands");

    await rest.put(Routes.applicationCommands(client.application.id), { body: commands });
    logger.debug("Command data sent")

    logger.info("Loaded! Ready to use.");
})

// Handles interactions
client.on("interactionCreate", (interaction) => {
    if(interaction.isChatInputCommand()) {
        for(const key in modules) {
            const module = modules[key];
            if(module.name.toLowerCase() != interaction.commandName) continue;

            module.commands.forEach(command => {
                if(command.name != interaction.options.getSubcommand(true)) return;

                logger.debug("Running command", command.name, "from", `${interaction.user.username} (${interaction.user.id})`);
                command.executor(interaction)
            })

            break;
        }
    } else if(interaction.isAutocomplete()) {
        for(const key in modules) {
            const module = modules[key];
            if(module.name.toLowerCase() != interaction.commandName) continue;

            module.commands.forEach(command => {
                if(command.name != interaction.options.getSubcommand(true) || !command.autoComplete) return;

                logger.debug("Running command", command.name);
                command.autoComplete(interaction)
            })

            break;
        }
    } else if(interaction.isModalSubmit()) {
        for(const key in modules) {
            const module = modules[key];
            module.onModalSubmit(interaction);
        }
    }
})

client.on("guildMemberAdd", member => {
    if(!process.env.UNASSIGNED_ROLE) {
        return logger.error("Error! Unassigned role is not set in .env!")
    }

    member.roles.add(process.env.UNASSIGNED_ROLE).then(m => logger.debug(`User ${member.displayName} (${member.id}) joined. Assigned unranked role.`));
})

mongoose.connect(process.env.MONGO);