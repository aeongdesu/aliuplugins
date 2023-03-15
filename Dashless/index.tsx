import { Plugin } from "aliucord/entities"
import { ReactNative } from "aliucord/metro"
import { findInReactTree } from "aliucord/utils"

const { View } = ReactNative
const dash = /-/g

export default class Dashless extends Plugin {
    public async start() {
        const unpatch = this.patcher.after(View, "render", (_, __, res) => {
            const textChannel = findInReactTree(res, r => r?.props?.channel?.name && r?.props?.hasOwnProperty?.("isRulesChannel"))
            if (!textChannel) return
            this.patcher.after(textChannel.type, "type", (_, res: any) => {
                const textChannelName = findInReactTree(res, r => typeof r?.children === "string")
                if (!textChannelName) return
                textChannelName.children = textChannelName.children.replace(dash, " ")
                return res
            })
            unpatch()
        })
    }
    public stop() {
        this.patcher.unpatchAll()
    }
}