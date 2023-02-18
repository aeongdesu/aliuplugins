// like https://github.com/redstonekasi/vendetta-plugins/blob/main/plugins/url-import/src/index.js

declare let aliucord: any
import { Plugin } from "aliucord/entities";
// @ts-ignore
import { getByProps, Dialog, Toasts } from "aliucord/metro";
import { getAssetId } from "aliucord/utils"
// @ts-ignore
import { PLUGINS_DIRECTORY } from "aliucord/utils/constants"
import { before } from "aliucord/utils/patcher"
// @ts-ignore
import { fs } from "aliucord/native";

const zip = new RegExp("https?://(?:github|raw\\.githubusercontent)\\.com/([A-Za-z0-9\\-_.]+)/([A-Za-z0-9\\-_.]+)/(?:raw|blob)?/?\\w+/builds/(\\w+).zip")

export default class PluginDownloader extends Plugin {
    public async start() {
        const ActionSheet = getByProps("hideActionSheet");
        before(ActionSheet, "openLazy", (ctx) => {
            let args = ctx.args;
            if (args[1] !== "LongPressUrl") return;
            const [, , { header: { title: url }, options }] = args;
            if (!zip.test(url)) return;
            options.push({
                label: "Install Plugin",
                onPress: async () => {
                    const matches = url.match(zip);
                    try {
                        const installPlugin = async () => {
                            await fs.download(url, `${PLUGINS_DIRECTORY}${matches[3]}.zip`);
                            await aliucord.api.startPlugins()
                            plugin = aliucord.api.plugins[matches[3]]
                            if (plugin) return Toasts.open({ content: `Successfully installed ${plugin.manifest.name}!`, source: getAssetId("Check") })
                            else {
                                await fs.deleteFile(`${PLUGINS_DIRECTORY}${matches[3]}.zip`)
                                return Toasts.open({ content: "Failed to install plugin!", source: getAssetId("Small") })
                            }
                        }
                        let plugin = aliucord.api.plugins[matches[3]]
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
                        await fs.deleteFile(`${PLUGINS_DIRECTORY}${matches[3]}.zip`)
                        return Toasts.open({ content: "Failed to install plugin!", source: getAssetId("Small") })
                    }
                    /*Dialog.show({
                        title: "Reload required",
                        body: `Downloaded ${matches[3]}, reload Discord?\nexport loadPlugin when (never)`,
                        confirmText: 'Yes',
                        cancelText: 'No and delete it',
                        isDismissable: false,
                        onConfirm: () => restartApp(),
                        onCancel: async () => {
                            await fs.deleteFile(`${PLUGINS_DIRECTORY}${matches[3]}.zip`)
                            Toasts.open({ content: `${matches[3]}.zip has deleted.` })
                        }
                    })*/
                }
            });
        });
    }
}