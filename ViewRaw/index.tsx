import { Plugin } from "aliucord/entities"
// @ts-ignore
import { React, ReactNative, getByProps, Dialog, Toasts } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
import RawPage from "./RawPage"

export default class ViewRaw extends Plugin {
    static message: any
    public async start() {
        const ActionSheet = getByProps("hideActionSheet")
        const Navigation = getByProps("push", "pushLazy", "pop")
        const DiscordNavigator = getByProps("getRenderCloseButton")
        const { default: Navigator, getRenderCloseButton } = DiscordNavigator

        this.patcher.before(ActionSheet, "openLazy", (ctx) => {
            const [asyncComponent, args, message] = ctx.args
            if (args == "MessageLongPressActionSheet")
                asyncComponent.then(instance => {
                    const unpatch = this.patcher.after(instance, "default", (_, component: any) => {
                        const [msgProps, oldbuttons] = component.props?.children?.props?.children?.props?.children
                        if (!msgProps) ViewRaw.message = message
                        else ViewRaw.message = msgProps.props.message
                        if (oldbuttons) {
                            const MarkUnreadIndex = oldbuttons.findIndex((a: { props: { message: string } }) => a.props.message == "Mark Unread")
                            const ButtonRow = oldbuttons[MarkUnreadIndex].type
                            const navigator = () => (
                                <Navigator
                                    initialRouteName="RawPage"
                                    goBackOnBackPress={true}
                                    screens={{
                                        RawPage: {
                                            title: "ViewRaw",
                                            headerLeft: getRenderCloseButton(() => Navigation.pop()),
                                            render: RawPage
                                        }
                                    }}
                                />
                            )
                            component.props.children.props.children.props.children[1] = [...oldbuttons, <ButtonRow
                                message="View Raw"
                                iconSource={getAssetId("ic_chat_bubble_16px")}
                                onPressRow={() => {
                                    ActionSheet.hideActionSheet()
                                    Navigation.push(navigator)
                                }}
                            />]
                        }
                        unpatch()
                    })
                })
        })
    }
    public stop() {
        this.patcher.unpatchAll()
    }
}