import { Plugin } from "aliucord/entities"
// @ts-ignore
import { React, ReactNative, getByProps, Dialog, Toasts } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
import { before, after } from "aliucord/utils/patcher"
import RawPage from "./RawPage"

export default class ViewRaw extends Plugin {
    static message: any
    public async start() {
        const ActionSheet = getByProps("hideActionSheet")
        const Navigation = getByProps("push", "pushLazy", "pop")
        const DiscordNavigator = getByProps("getRenderCloseButton")
        const { default: Navigator, getRenderCloseButton } = DiscordNavigator

        before(ActionSheet, "openLazy", (ctx) => {
            const [asyncComponent, args] = ctx.args
            if (args == "MessageLongPressActionSheet")
                asyncComponent.then(instance => {
                    after(instance, "default", (_, component) => {
                        const [{ props: { message: message } }, oldbuttons] = component.props?.children?.props?.children?.props?.children
                        ViewRaw.message = message
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
                            if (oldbuttons.filter((a: { props: { message: string } }) => a.props.message == "View Raw").length > 0) return
                            component.props.children.props.children.props.children[1] = [...oldbuttons, <ButtonRow
                                message="View Raw"
                                iconSource={getAssetId("ic_chat_bubble_16px")}
                                onPressRow={() => {
                                    ActionSheet.hideActionSheet()
                                    Navigation.push(navigator)
                                }}
                            />]
                        }
                    })
                })
        })
    }
}