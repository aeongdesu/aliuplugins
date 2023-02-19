// like https://github.com/redstonekasi/vendetta-plugins/blob/main/plugins/url-import/src/index.js

declare let aliucord: any
import { Plugin } from "aliucord/entities"
// @ts-ignore
import { getByProps, Dialog, Toasts } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
// @ts-ignore
import { PLUGINS_DIRECTORY } from "aliucord/utils/constants"
import { before } from "aliucord/utils/patcher"
// @ts-ignore
import { fs } from "aliucord/native"

const zip = new RegExp("https?://(?:github|raw\\.githubusercontent)\\.com/([A-Za-z0-9\\-_.]+)/([A-Za-z0-9\\-_.]+)/(?:raw|blob)?/?\\w+/builds/(\\w+).zip")

export default class PluginDownloader extends Plugin {
    public async start() {
        const ActionSheet = getByProps("hideActionSheet")
        before(ActionSheet, "openLazy", (ctx) => {
            let args = ctx.args
            if (args[1] !== "LongPressUrl") return
            const [, , { header: { title: url }, options }] = args
            if (!zip.test(url)) return
            options.push({
                label: "Install Plugin",
                onPress: async () => {
                    const matches = url.match(zip)
                    const proxyurl = (name: string) => `https://cdn.jsdelivr.net/gh/${matches[1]}/${matches[2]}@builds/${name}`
                    try {
                        const manifest = await fetch(proxyurl(`${matches[3]}-manifest.json`))
                        if (!manifest.ok) return Toasts.open({ content: "Wrong plugin url!", source: getAssetId("Small") })
                        const pluginName = (await manifest.json()).name

                        const installPlugin = async () => {
                            await fs.download(proxyurl(`${pluginName}.zip`), `${PLUGINS_DIRECTORY}${pluginName}.zip`)
                            await aliucord.api.startPlugins()
                            plugin = aliucord.api.plugins[pluginName]
                            if (plugin) return Toasts.open({ content: `Successfully installed ${plugin.manifest.name}!`, source: getAssetId("Check") })
                            else {
                                await fs.deleteFile(`${PLUGINS_DIRECTORY}${pluginName}.zip`)
                                return Toasts.open({ content: "Failed to install plugin!", source: getAssetId("Small") })
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
                                onConfirm: () => installPlugin(),
                            })
                        }
                        installPlugin()
                    } catch {
                        const path = `${PLUGINS_DIRECTORY}${matches[3]}.zip`
                        if (fs.exists(path)) await fs.deleteFile(path)
                        return Toasts.open({ content: "Failed to install plugin!", source: getAssetId("Small") })
                    }
                    /*Dialog.show({
                        title: "Reload required",
                        body: `Downloaded ${pluginName}, reload Discord?\nexport loadPlugin when (never)`,
                        confirmText: 'Yes',
                        cancelText: 'No and delete it',
                        isDismissable: false,
                        onConfirm: () => restartApp(),
                        onCancel: async () => {
                            await fs.deleteFile(`${PLUGINS_DIRECTORY}${pluginName}.zip`)
                            Toasts.open({ content: `${pluginName}.zip has deleted.` })
                        }
                    })*/
                }
            })
        })
    }
}