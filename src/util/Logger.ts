export class Logger {
    name: string;
    // ANSI color codes, automatically done with "\u001b[(NUMBER HERE)m"
    static rgb(red: number, green: number, blue: number) : string {
        return `\u001b[38;2;${red};${green};${blue}m`;
    }

    constructor(name: string) {
        this.name = name;
    }

    static infoColor = this.rgb(0, 255, 0);
    static errColor = this.rgb(255, 0, 0);
    static warnColor = this.rgb(255, 255, 0);
    static debugColor = this.rgb(255, 0, 255);
    static textColor = "\u001b[0m";

    constructLogMessage(level: string, text: string[]): string {
        return `${new Date().toUTCString()} ${level}: [${this.name}] ${Logger.textColor} ${text.join(" ")}` // taken from botmocracy trololo
    }

    info(...text: string[]) {
        console.info(Logger.infoColor, this.constructLogMessage("INFO", text));
    }

    warn(...text: string[]) {
        console.warn(Logger.warnColor, this.constructLogMessage("WARN", text));
    }

    error(...text: string[]) {
        console.error(Logger.errColor, this.constructLogMessage("ERROR", text));
    }

    debug(...text: string[]) {
        if(process.env.DEBUG != "true") return;
        console.warn(Logger.debugColor, this.constructLogMessage("DEBUG", text));
    }
}