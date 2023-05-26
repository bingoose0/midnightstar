import Module from "../Module";


export default class Logs extends Module {
    name = "Logs"

    createCommands(): void {
    }

    async onReady() {
        const channel = await this.findChannel(process.env.LOGS_CHANNEL_ID);
        if(!channel || !channel.isTextBased()) {
            return this.logger.error(!channel.isTextBased() ? "Sales log channel is not text based!" : "Sales log channel is invalid!");
        }

        if(process.env.DEBUG != "true") {
            channel.send("**Bot is online**")
        }
    }
}