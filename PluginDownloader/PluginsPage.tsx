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
const { useState, useEffect, useCallback } = React
const { ScrollView } = ReactNative

const styles = Styles.createThemedStyleSheet({
    button: { marginTop: 12 }
})

export default function PluginsPage() {
    const matches = PluginDownloader.matches
    const [plugins, setResults] = useState([])
    const [isEnabled, setEnabled] = useState({ id: -1, status: false })
    useEffect(() => {
        const getPlugins = async () => {
            const url = `https://cdn.jsdelivr.net/gh/${matches[1]}/${matches[2]}@builds/`
            const data = await fetch(url)
            if (!data.ok) return []
            const text = await data.text()
            const regex = /(\w+)\.zip</g
            let hmatches, results: string[] = []
            while (hmatches = regex.exec(text)) {
                results.push(hmatches[1])
            }
            // @ts-ignore
            return setResults(results)
        }
        getPlugins()
    }, [])

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
                                await fs.download(`https://cdn.jsdelivr.net/gh/${matches[1]}/${matches[2]}@builds/${pluginName}.zip`, `${PLUGINS_DIRECTORY}${pluginName}.zip`)
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