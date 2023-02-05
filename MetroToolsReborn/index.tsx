// https://github.com/c10udburst-discord/Aliucord-RightNow-Plugins/blob/release/MetroTools/index.ts

import { Plugin } from "aliucord/entities";
import { searchByKeyword, getByProps, getModule } from "aliucord/metro";

export default class MetroToolsReborn extends Plugin {
    public async start() {
        const ClydeUtils = getByProps("sendBotMessage");
        try {
            this.commands.registerCommand({
                name: "findprops",
                description: "Find module by props.",
                options: [ // using ApplicationCommandOptionType breaks it
                    {
                        name: "query",
                        description: "What to search for. Use space for multiple props.",
                        required: true,
                        type: 3 // string
                    },
                    {
                        name: "exact",
                        description: "Whether to match exactly or search for substrings",
                        required: false,
                        type: 5 // bool
                    }
                ],
                execute(args, ctx) {
                    let query = args[0].value as string;
                    let exact = args[1]?.value as boolean || false;

                    var module: any = null;
                    if (exact) {
                        module = getByProps(...query.split(/\s/g));
                    } else {
                        module = getModule(m => {
                            const stringified = JSON.stringify(Object.keys(m));
                            return query.split(/\s/g).filter(keyword => !stringified.includes(keyword)).length < 1;
                        })
                    }

                    if (module) {
                        let array = "";

                        Object.keys(module).forEach(prop => {
                            try {
                                var repr: string = "unknown";
                                let descriptor = Object.getOwnPropertyDescriptor(module, prop);
                                if (descriptor?.get) { repr = "getter" }
                                else {
                                    let value = module[prop]
                                    if (value instanceof Function) {
                                        //@ts-ignore
                                        repr = AliuHermes.getBytecode(value).split('\n', 1)[0];
                                    } else {
                                        repr = JSON.stringify(value);
                                    }
                                }
                                array += `> ${prop}\n\`${repr}\`\n\n` // crazy
                            } catch (ex) {
                                array += `> ${prop}\n\`${ex}\`\n\n` // crazy
                            }

                        })

                        return ClydeUtils.sendBotMessage(ctx.channel.id, array);
                    } else {
                        return ClydeUtils.sendBotMessage(ctx.channel.id, "No modules found :exploding_head:");
                    }
                }
            });
            this.commands.registerCommand({
                name: "searchByKeyword",
                description: "Find all modules with properties containing the specified keyword.",
                options: [ // using ApplicationCommandOptionType breaks it
                    {
                        name: "query",
                        description: "What to search for.",
                        required: true,
                        type: 3 // string
                    }
                ],
                execute(args, ctx) {
                    let query = args[0].value as string;
                    const modules = searchByKeyword(query);
                    if (modules.length === 0) return ClydeUtils.sendBotMessage(ctx.channel.id, "No modules found :exploding_head:");
                    return ClydeUtils.sendBotMessage(ctx.channel.id, modules.join("\n"));
                }
            });
        } catch (ex) {
            this.logger.error(ex)
        }
    }
}