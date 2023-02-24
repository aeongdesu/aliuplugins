// REFACTORING REQUIRED
// PULL REQUESTS ARE WELCOME

declare let aliucord: any
import { Plugin } from "aliucord/entities"
// @ts-ignore
import { React, getByProps, Dialog, Toasts } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
// @ts-ignore
import { PLUGINS_DIRECTORY } from "aliucord/utils/constants"
import { before } from "aliucord/utils/patcher"
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
        before(ActionSheet, "openLazy", (ctx) => {
            let args = ctx.args
            if (args[1] !== "LongPressUrl") return
            const [, , { header: { title: url }, options }] = args
            if (zip.test(url)) {
                options.push({
                    label: "Install Plugin",
                    onPress: async () => {
                        const matches = url.match(zip)
                        /*
                            matches[1]: username
                            matches[2]: reponame
                            matches[3]: filename
                        */
                        const proxyurl = (name: string) => `https://cdn.jsdelivr.net/gh/${matches[1]}/${matches[2]}@builds/${name}`
                        try {
                            const manifest = await fetch(proxyurl(`${matches[3]}-manifest.json`))
                            if (!manifest.ok) return Toasts.open({ content: "Wrong plugin URL", source: getAssetId("Small") })
                            const pluginName = (await manifest.json()).name

                            const installPlugin = async () => {
                                await fs.download(proxyurl(`${pluginName}.zip`), `${PLUGINS_DIRECTORY}${pluginName}.zip`)
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
                })
            } else if (repo.test(url)) {
                PluginDownloader.matches = url.match(repo)
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
                options.push({
                    label: "Install Plugins",
                    onPress: () => Navigation.push(navigator)
                })
            }
        })
    }
}