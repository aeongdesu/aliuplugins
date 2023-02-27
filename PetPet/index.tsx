import { Plugin } from "aliucord/entities"
import { UserStore, MessageActions, getByProps } from "aliucord/metro"
import { ApplicationCommandOptionType } from "aliucord/api"

export default class PetPet extends Plugin {
    public async start() {
        const { sendBotMessage } = getByProps("sendBotMessage")
        this.commands.registerCommand({
            name: "petpet",
            description: "Pet someone. *Files are purged every 24 hours*",
            options: [
                {
                    name: "user",
                    description: "The user to pet",
                    type: ApplicationCommandOptionType.USER6,
                    required: true
                },
                {
                    name: "global",
                    description: "Use a global avatar even if user has a guild avatar, default is false.",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const userid = args[0].value
                const global = args[1]?.value as boolean
                const user = UserStore.getUser(userid)
                const guildAvatar = user.guildMemberAvatars[ctx.guild.id]
                let url: string

                if (!global && guildAvatar) url = `https://cdn.discordapp.com/guilds/${ctx.guild.id}/users/${userid}/avatars/${guildAvatar}.png`
                else url = `https://cdn.discordapp.com/avatars/${userid}/${user.avatar}.png`
                const petpet = await fetch(`https://petpet-api.clit.repl.co/petpet?url=${url}&size=100&delay=20&version=v2`)
                if (!petpet.ok) return sendBotMessage(ctx.channel.id, "Failed to fetch petpet")
                const json = await petpet.json()
                MessageActions.sendMessage(ctx.channel.id, { content: json.result })
            }
        })
    }
    
    public stop() {
        this.commands.unregisterAll()
    }
}
