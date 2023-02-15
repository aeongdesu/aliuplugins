import { Plugin } from "aliucord/entities";
import { UserStore, MessageActions } from "aliucord/metro";
import { ApplicationCommandOptionType } from "aliucord/api";

/*
export default class Petpet extends Plugin {
    public async start() {
        this.commands.registerCommand({
            name: "petpet",
            description: "Pet someone",
            options: [
                {
                    name: "user",
                    description: "The user to pet",
                    type: ApplicationCommandOptionType.USER6,
                    required: true
                }
            ],
            execute: async (args, ctx) => {
                const userid = args[0].value;
                const user = UserStore.getUser(userid)
                console.log(`https://cdn.discordapp.com/embed/avatars/${user.avatar}.png`)
                //MessageActions.sendMessage(ctx.channel.id, { content: `https://api.obamabot.cf/v1/image/petpet?avatar=https://cdn.discordapp.com/embed/avatars/${userid}.png?size=4096` })
            }
        });
    }
}
*/