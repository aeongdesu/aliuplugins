import { Plugin } from "aliucord/entities";
import { getByProps, MessageActions } from "aliucord/metro";
import { ApplicationCommandOptionType } from "aliucord/api";

// wip
// make settings for default username or id
// date to snowflare (hard)

export default class Osu extends Plugin {
    public async start() {
        const ClydeUtils = getByProps("sendBotMessage")
        this.commands.registerCommand({
            name: "osu",
            description: "Search osu!standard stats of someone.",
            options: [
                {
                    name: "username",
                    description: "self explanatory",
                    type: ApplicationCommandOptionType.STRING,
                    required: false
                },
                {
                    name: "id",
                    description: "self explanatory",
                    type: ApplicationCommandOptionType.NUMBER,
                    required: false
                },
                {
                    name: "send",
                    description: "Whether to send the resulting stats",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const getOption = (name: string, type: number) => {
                    return args.find(x => x.type == type && x.name == name)?.value
                }
                const timestampToSnowflake = (date: string) => { // wip
                    const DiscordEpoch = 1420070400000
                    const result = 0
                    return `<t:${result}:>`
                }
                const username = getOption("username", ApplicationCommandOptionType.STRING)
                const id = getOption("id", ApplicationCommandOptionType.NUMBER)
                const send = getOption("send", ApplicationCommandOptionType.BOOLEAN) || false
                if (!username && !id) return ClydeUtils.sendBotMessage(ctx.channel.id, "give me username or id :exploding_head:")
                const fetchdata = await fetch(`https://newty.dev/api/osu${username ? "?username=" : "?id="}${username ? username : id}`, { method: "GET" })
                if (!fetchdata.ok) return ClydeUtils.sendBotMessage(ctx.channel.id, "Failed to fetch data")
                const data = await fetchdata.json()
                if (data.message) return ClydeUtils.sendBotMessage(ctx.channel.id, data.message)
                const msg = `> ${data.username}: ${data.pp}pp (#${data.globalRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${data.countryCode}${data.countryRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")})\n
> Accuracy: \`${data.accuracy}%\` • Level: \`${data.level}\`
> Playcount: \`${data.playCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\` (\`${Math.floor((data.timePlayedInMs / (1000 * 60 * 60)))} hrs\`)
> Ranks: **SSH** \`${data.ranks.ss.silver}\` **SS** \`${data.ranks.ss.gold}\` **SH** \`${data.ranks.s.silver}\` **S** \`${data.ranks.s.gold}\` **A** \`${data.ranks.a}\`

> Joined osu! ${data.joinDate}`

                if (send) return MessageActions.sendMessage(ctx.channel.id, { content: msg })
                else return ClydeUtils.sendBotMessage(ctx.channel.id, msg)
            }
        });
    }
    public stop() {
        this.commands.unregisterAll()
    }
}