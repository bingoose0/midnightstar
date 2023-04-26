import { Client, REST, Routes, SlashCommandBuilder } from "discord.js";
import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as fs from "fs";

import { Logger } from "./util/Logger";
import Module from "./Module";

dotenv.config();

const token = process.env.TOKEN || "missing_token"
const mongoUrl = process.env.MONGO || "missing_url"

const client = new Client({ intents: 513 });
client.login(process.env.TOKEN);

const modules = new Array<Module>();
const commands = new Array<SlashCommandBuilder>();

const rest = new REST({ version: "10" }).setToken(token);
const logger = new Logger("Main");

client.on("ready", async (client: Client<true>) => {
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

                logger.debug("Running command", command.name);
                command.executor(interaction)
            })

            break;
        }
    }
})