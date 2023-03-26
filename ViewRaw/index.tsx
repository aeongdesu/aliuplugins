import { Plugin } from "aliucord/entities"
// @ts-ignore
import { React, getByProps, getByDisplayName, Forms } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
import RawPage from "./RawPage"

const ActionSheet = getByProps("hideActionSheet")
const Navigation = getByProps("push", "pushLazy", "pop")
const DiscordNavigator = getByProps("getRenderCloseButton")
const { default: Navigator, getRenderCloseButton } = DiscordNavigator
const Icon = getByDisplayName("Icon")
const { FormRow } = Forms

export default class ViewRaw extends Plugin {
    static message: any
    public async start() {
        this.patcher.before(ActionSheet, "openLazy", (ctx) => {
            const [asyncComponent, args, actionMessage] = ctx.args
            if (args != "MessageLongPressActionSheet") return
            asyncComponent.then(instance => {
                const unpatch = this.patcher.after(instance, "default", (_, component: any) => {
                    const [msgProps, oldbuttons] = component.props?.children?.props?.children?.props?.children
                    if (!msgProps) ViewRaw.message = actionMessage.message
                    else ViewRaw.message = msgProps.props.message
                    if (!oldbuttons) return
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

                    component.props.children.props.children.props.children[1] = [...oldbuttons,
                    <FormRow
                        label="View Raw"
                        leading={<Icon source={getAssetId("ic_chat_bubble_16px")} />}
                        onPress={() => {
                            ActionSheet.hideActionSheet()
                            Navigation.push(navigator)
                        }}
                    />]
                    unpatch()
                })
            })
        })
    }
    public stop() {
        this.patcher.unpatchAll()
    }
}