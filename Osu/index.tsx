import { Plugin } from "aliucord/entities"
import { Forms, React, Styles, ReactNative, getByProps, MessageActions, URLOpener } from "aliucord/metro"
import { ApplicationCommandOptionType } from "aliucord/api"
const { FormSection, FormInput, FormDivider } = Forms
const { Text, ScrollView } = ReactNative
let instance

// todo
// use osu!api v1 or v2

const styles = Styles.createThemedStyleSheet({
    subText: {
        fontSize: 18,
        marginTop: 15,
        marginLeft: 15,
        color: Styles.ThemeColorMap.HEADER_PRIMARY,
        fontFamily: Styles.ThemeColorMap.PRIMARY_NORMAL
    },
    textLink: {
        color: Styles.ThemeColorMap.TEXT_LINK
    }
})

// https://stackoverflow.com/a/64454486
const newUYDate = (pDate: any) => {
    const dd = pDate.split("/")[0].padStart(2, "0")
    let mm = pDate.split("/")[1].padStart(2, "0")
    const yyyy = pDate.split("/")[2].split(" ")[0]
    const hh = pDate.split("/")[2].split(" ")[1].split(":")[0].padStart(2, "0")
    const mi = pDate.split("/")[2].split(" ")[1].split(":")[1].padStart(2, "0")
    const secs = pDate.split("/")[2].split(" ")[1].split(":")[2].padStart(2, "0")

    mm = (parseInt(mm) - 1).toString() // January is 0

    return +new Date(yyyy, mm, dd, hh, mi, secs) / 1000
}

export default class Osu extends Plugin {
    public async start() {
        instance = this
        const { sendBotMessage } = getByProps("sendBotMessage")
        this.commands.registerCommand({
            name: "osu",
            description: "Search osu!standard stats of someone.",
            options: [
                {
                    name: "username",
                    description: "You can set the default value in plugin settings",
                    type: ApplicationCommandOptionType.STRING,
                    required: false
                },
                {
                    name: "id",
                    description: "You can set the default value in plugin settings",
                    type: ApplicationCommandOptionType.NUMBER,
                    required: false
                },
                {
                    name: "send",
                    description: "Whether to send the result",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const getOption = (name: string, type: number) => {
                    return args.find(x => x.type == type && x.name == name)?.value
                }
                const username = getOption("username", ApplicationCommandOptionType.STRING) || this.settings.get("username", false)
                const id = getOption("id", ApplicationCommandOptionType.NUMBER) || this.settings.get("id", false)
                const send = getOption("send", ApplicationCommandOptionType.BOOLEAN) || false
                if (!username && !id) return sendBotMessage(ctx.channel.id, "give me username or id :exploding_head:")
                const fetchdata = await fetch(`https://newty.dev/api/osu${username ? `?username=${username}` : `?id=${id}`}`, { method: "GET" })
                if (!fetchdata.ok) return sendBotMessage(ctx.channel.id, "Failed to fetch data")
                const data = await fetchdata.json()
                if (data.message) return sendBotMessage(ctx.channel.id, data.message)
                const msg = `> **${data.username}: ${data.pp}pp (#${data.globalRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${data.countryCode}${data.countryRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")})**
                            <https://osu.ppy.sh/users/${data.id}>
                            > Accuracy: \`${data.accuracy}%\` • Level: \`${data.level}\`
                            > Playcount: \`${data.playCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\` (\`${Math.floor((data.timePlayedInMs / (1000 * 60 * 60)))} hrs\`)
                            > Ranks: **SSH** \`${data.ranks.ss.silver}\` **SS** \`${data.ranks.ss.gold}\` **SH** \`${data.ranks.s.silver}\` **S** \`${data.ranks.s.gold}\` **A** \`${data.ranks.a}\`\n
                            > Joined osu! <t:${newUYDate(data.joinDate)}:f>`.replace(/^\s+/gm, "")

                if (send) return MessageActions.sendMessage(ctx.channel.id, { content: msg })
                else return sendBotMessage(ctx.channel.id, msg)
            }
        })
    }
    public stop() {
        this.commands.unregisterAll()
    }
    public SettingsModal() {
        const settingsInstance = () => instance.settings
        const useSettings = (name?: string) => {
            const [, forceUpdate] = React.useReducer(x => x + 1, 0)
            return {
                get(key, defaultValue?) {
                    if (name) {
                        return settingsInstance().get(name, {})[key] ?? defaultValue
                    }
                    return settingsInstance().get(key, defaultValue)
                },
                set(key, value) {
                    if (name) {
                        const obj = settingsInstance().get(name, {})
                        obj[key] = value.length === 0 ? undefined : value
                        settingsInstance().set(name, obj)
                    } else {
                        settingsInstance().set(key, value)
                    }
                    forceUpdate()
                }
            }
        }
        const { get, set } = useSettings()
        const Navigation = getByProps("push", "pushLazy", "pop")
        const DiscordNavigator = getByProps("getRenderCloseButton")
        const { default: Navigator, getRenderCloseButton } = DiscordNavigator

        const SettingsPage = () => {
            return (<>
                {/* @ts-ignore */}
                <ScrollView>
                    {/* @ts-ignore */}
                    <Text style={styles.subText}>
                        {/* @ts-ignore */}
                        Currently, this plugin uses <Text style={styles.textLink} onPress={() => URLOpener.openURL("https://newty.dev")} >newt's api</Text>.
                    </Text>
                    {/*
                    <FormSection title="osu!api Configurations">
                        <FormInput
                            title="Client ID"
                            value={get("clientID")}
                            placeholder="00000"
                            onChange={v => set("clientID", v)}
                        />
                        <FormDivider />
                        <FormInput
                            title="Client Secret"
                            value={get("clientSecret")}
                            placeholder="SufZdHfucPADfK9LJn2VcEHuC7FGYpUaF9m4S8m6"
                            onChange={v => set("clientSecret", v)}
                        />
                    </FormSection>
                    */}
                    <FormSection title="Default Configurations">
                        <FormInput
                            title="profile username"
                            value={get("username")}
                            placeholder="peppy"
                            onChange={v => set("username", v)}
                        />
                        <FormDivider />
                        <FormInput
                            title="profile id"
                            value={get("id")}
                            placeholder="2"
                            onChange={v => set("id", v)}
                        />
                    </FormSection>
                </ScrollView>
            </>)
        }

        return (
            <Navigator
                initialRouteName="osu! settings"
                goBackOnBackPress={true}
                screens={{
                    OsuSettings: {
                        title: "osu! settings",
                        headerLeft: getRenderCloseButton(() => Navigation.pop()),
                        render: SettingsPage
                    }
                }}
            />
        )

    }
}
