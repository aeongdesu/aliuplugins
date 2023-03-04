import { Plugin } from "aliucord/entities"
import { getByProps, MessageActions } from "aliucord/metro"
import { ApplicationCommandOptionType } from "aliucord/api"

export default class TimeTools extends Plugin {
    public async start() {
        const { sendBotMessage } = getByProps("sendBotMessage")
        // timestamp
        this.commands.registerCommand({
            name: "timestamp",
            description: "Generates an unix timestamp",
            options: [
                {
                    name: "yyyy",
                    description: "The year",
                    type: ApplicationCommandOptionType.INTEGER,
                    required: true
                },
                {
                    name: "MM",
                    description: "The month",
                    type: ApplicationCommandOptionType.INTEGER,
                    required: true
                },
                {
                    name: "dd",
                    description: "The day",
                    type: ApplicationCommandOptionType.INTEGER,
                    required: true
                },
                {
                    name: "HH",
                    description: "The hour",
                    type: ApplicationCommandOptionType.INTEGER,
                    required: true
                },
                {
                    name: "mm",
                    description: "The minute",
                    type: ApplicationCommandOptionType.INTEGER,
                    required: true
                },
                {
                    name: "ss",
                    description: "The second",
                    type: ApplicationCommandOptionType.INTEGER,
                    required: true
                }
            ],
            execute(args, ctx) {
                const getOption = (name: string) => {
                    return args.find(x => x.name == name)?.value || false
                }
                const year = getOption("yyyy")
                const month = getOption("MM")
                const day = getOption("dd")
                const hour = getOption("HH")
                const minute = getOption("mm")
                const second = getOption("ss")
                const timestamp = "<t:" + Math.floor(+new Date(year, month - 1, day, hour, minute, second) / 1000) + ":F>"
                
                return sendBotMessage(ctx.channel.id, timestamp)
            }
        })
        // snowflake
        this.commands.registerCommand({
            name: "snowflake",
            description: "Converts discord ID to date",
            options: [
                {
                    name: "snowflake",
                    description: "The snowflake to convert",
                    type: ApplicationCommandOptionType.STRING,
                    required: true
                }
            ],
            execute(args, ctx) {
                const getOption = (name: string) => {
                    return args.find(x => x.name == name)?.value || false
                }
                const snowflake = getOption("snowflake")
                if (!Number.isInteger(+snowflake)) return sendBotMessage(ctx.channel.id, "wrong snowflake.")
                // https://github.com/vegeta897/snow-stamp/blob/main/src/convert.js#L4
                const snowflakeToUnix = (date: number) => {
                    const discordEpoch = 1420070400000
                    const dateBits = BigInt(date) >> 22n
                    const unix = Number(dateBits) + discordEpoch
                    return Math.floor(unix / 1000)
                }

                return sendBotMessage(ctx.channel.id, "<t:" + snowflakeToUnix(snowflake) + ":F>")
            }
        })
    }
    public stop() {
        this.commands.unregisterAll()
    }
}