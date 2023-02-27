// REFACTORING REQUIRED
// PULL REQUESTS ARE WELCOME

// @ts-ignore
import { React, ReactNative, getByProps, Styles, Toasts } from "aliucord/metro"
// @ts-ignore
import { fs } from "aliucord/native"
// @ts-ignore
import { PLUGINS_DIRECTORY } from "aliucord/utils/constants"
import { getAssetId } from "aliucord/utils"

import PluginDownloader from "./index"

const Button = getByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default as any
const { useState, useEffect } = React
const { ScrollView } = ReactNative

const styles = Styles.createThemedStyleSheet({
    button: { marginTop: 12 }
})

export default function PluginsPage() {
    const matches = PluginDownloader.matches
    const [plugins, setResults] = useState<string[]>([])
    const [isEnabled, setEnabled] = useState({ id: -1, status: false })

    useEffect(() => {
        const getPlugins = async () => {
            const data = await fetch(`https://github.com/${matches[1]}/${matches[2]}/tree/builds`, {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
                }
            })
            const text = await data.text()
            const regex = /data-turbo-frame="repo-content-turbo-frame"\shref="(?:[A-Za-z0-9\-_.\/]+)">(\w+)\.zip<\/a>/g
            let hmatches: string[], results: string[] = []
            while (hmatches = regex.exec(text)!) {
                results.push(hmatches![1])
            }
            return setResults(results)
        }
        getPlugins()
    }, [isEnabled])

    return (<>
        {/* @ts-ignore */}
        <ScrollView>
            {plugins.map((pluginName, index) => {
                let plugin = PluginDownloader.aliucord.api.plugins[pluginName]
                return (
                    <Button
                        key={index}
                        text={pluginName}
                        style={styles.button}
                        color={plugin || (isEnabled.id == index && isEnabled.status) ? "red" : "brand"}
                        size="small"
                        onPress={async () => {
                            try {
                                if (plugin) {
                                    await PluginDownloader.aliucord.api.uninstallPlugin(pluginName)
                                    return setEnabled({ id: index, status: false })
                                }
                                await fs.download(`https://raw.githubusercontent.com/${matches[1]}/${matches[2]}/builds/${pluginName}.zip`, `${PLUGINS_DIRECTORY}${pluginName}.zip`)
                                await PluginDownloader.aliucord.api.startPlugins()
                                plugin = PluginDownloader.aliucord.api.plugins[pluginName]
                                if (plugin) {
                                    setEnabled({ id: index, status: true })
                                    return Toasts.open({ content: `Successfully installed ${plugin.manifest.name}`, source: getAssetId("Check") })
                                } else {
                                    await fs.deleteFile(`${PLUGINS_DIRECTORY}${pluginName}.zip`)
                                    return Toasts.open({ content: "Failed to install plugin", source: getAssetId("Small") })
                                }
                            } catch (e) {
                                const path = `${PLUGINS_DIRECTORY}${pluginName}.zip`
                                if (fs.exists(path)) await fs.deleteFile(path)
                                console.log(e)
                                return Toasts.open({ content: "Failed to install plugin", source: getAssetId("Small") })
                            }
                        }}
                    />
                )
            })}
        </ScrollView>
    </>)
}