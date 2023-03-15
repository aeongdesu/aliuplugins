// REFACTORING REQUIRED
// PULL REQUESTS ARE WELCOME

declare let aliucord: any
import { Plugin } from "aliucord/entities"
// @ts-ignore
import { React, getByProps, Dialog, Toasts } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
// @ts-ignore
import { PLUGINS_DIRECTORY } from "aliucord/utils/constants"
// @ts-ignore
import { fs } from "aliucord/native"

import PluginsPage from "./PluginsPage"

const repo = /https\:\/\/github\.com\/([A-Za-z0-9\-_.]+)\/([A-Za-z0-9\-_.]+)/
const zip = /https\:\/\/github\.com\/([A-Za-z0-9\-_.]+)\/([A-Za-z0-9\-_.]+)\/(?:blob|raw)\/builds\/(\w+)\.zip/

export default class PluginDownloader extends Plugin {
    static matches: Array<string>
    static aliucord: any
    public async start() {
        PluginDownloader.aliucord = aliucord
        const ActionSheet = getByProps("hideActionSheet")
        const Navigation = aliucord.metro.Navigation ?? getByProps("push", "pushLazy", "pop")
        const DiscordNavigator = aliucord.metro.DiscordNavigator ?? getByProps("getRenderCloseButton")
        const { default: Navigator, getRenderCloseButton } = DiscordNavigator

        const navigator = () => (
            <Navigator
                initialRouteName="PluginDownloader"
                goBackOnBackPress={true}
                screens={{
                    PluginsPage: {
                        title: "PluginDownloader",
                        headerLeft: getRenderCloseButton(() => Navigation.pop()),
                        render: PluginsPage
                    }
                }}
            />
        )
        const downloadPlugin = async (url: string) => {
            const matches = url.match(zip)!
            /*
                matches[1]: username
                matches[2]: reponame
                matches[3]: filename
            */
            const rawurl = (name: string) => `https://raw.githubusercontent.com/${matches[1]}/${matches[2]}/builds/${name}`
            try {
                const manifest = await fetch(rawurl(`${matches[3]}-manifest.json`), { cache: "no-store" })
                if (!manifest.ok) return Toasts.open({ content: "Wrong plugin URL", source: getAssetId("Small") })
                const pluginName = (await manifest.json()).name

                const installPlugin = async () => {
                    await fs.download(rawurl(`${pluginName}.zip`), `${PLUGINS_DIRECTORY}${pluginName}.zip`)
                    await aliucord.api.startPlugins()
                    plugin = aliucord.api.plugins[pluginName]
                    if (plugin) return Toasts.open({ content: `Successfully installed ${plugin.manifest.name}`, source: getAssetId("Check") })
                    else {
                        await fs.deleteFile(`${PLUGINS_DIRECTORY}${pluginName}.zip`)
                        return Toasts.open({ content: "Failed to install plugin", source: getAssetId("Small") })
                    }
                }
                let plugin = aliucord.api.plugins[pluginName]
                if (plugin) {
                    return Dialog.show({
                        title: "Reinstall Plugin?",
                        body: `${plugin.manifest.name} is already installed.`,
                        confirmText: 'Yes',
                        cancelText: 'No',
                        isDismissable: true,
                        onConfirm: async () => await installPlugin(),
                    })
                }
                else await installPlugin()
            } catch {
                const path = `${PLUGINS_DIRECTORY}${matches[3]}.zip`
                if (fs.exists(path)) await fs.deleteFile(path)
                return Toasts.open({ content: "Failed to install plugin", source: getAssetId("Small") })
            }
        }

        this.patcher.before(ActionSheet, "openLazy", (ctx) => {
            const [asyncComponent, args, actionMessage] = ctx.args
            if (args == "MessageLongPressActionSheet") {
                asyncComponent.then((instance: any) => {
                    const unpatch = this.patcher.after(instance, "default", (_, component: any) => {
                        const [msgProps, oldbuttons] = component.props?.children?.props?.children?.props?.children
                        let message: any
                        if (!msgProps) message = actionMessage
                        else message = msgProps.props.message
                        if (oldbuttons) {
                            const MarkUnreadIndex = oldbuttons.findIndex((a: { props: { message: string } }) => a.props.message == "Copy Message Link")
                            const ButtonRow = oldbuttons[MarkUnreadIndex].type

                            if (zip.test(message.content)) {
                                component.props.children.props.children.props.children[1] = [<ButtonRow
                                    message="Install Plugin"
                                    iconSource={getAssetId("ic_download_24px")}
                                    onPressRow={async () => {
                                        await ActionSheet.hideActionSheet()
                                        await downloadPlugin(message.content)
                                    }}
                                />, ...oldbuttons]
                            } else if (repo.test(message.content)) {
                                PluginDownloader.matches = message.content.match(repo)
                                component.props.children.props.children.props.children[1] = [<ButtonRow
                                    message="Open PluginDownloader"
                                    iconSource={getAssetId("ic_download_24px")}
                                    onPressRow={() => {
                                        ActionSheet.hideActionSheet()
                                        Navigation.push(navigator)
                                    }}
                                />, ...oldbuttons]
                            }
                        }
                        unpatch()
                    })
                })
            }
            else if (args == "LongPressUrl") {
                const [, , { header: { title: url }, options }] = ctx.args
                if (zip.test(url)) {
                    options.push({
                        label: "Install Plugin",
                        onPress: async () => await downloadPlugin(url)
                    })
                } else if (repo.test(url)) {
                    PluginDownloader.matches = url.match(repo)
                    options.push({
                        label: "Open PluginDownloader",
                        onPress: () => Navigation.push(navigator)
                    })
                }
            }
        })
    }
    public stop() {
        this.patcher.unpatchAll()
    }
}
