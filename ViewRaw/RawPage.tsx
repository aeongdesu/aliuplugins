// @ts-ignore
import { React, ReactNative, Clipboard, Toasts, Constants, getByProps } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"

import ViewRaw from "./index"

const { ScrollView, Text, View } = ReactNative
const Button = getByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default as any

export default function RawPage() {
    const message = JSON.stringify(ViewRaw.message, null, 4)
    return (<>
        <ScrollView style={{ flex: 1 }}>
            <Button
                text="Copy Raw Data"
                color="brand"
                size="small"
                style={{ padding: 12 }}
                onPress={() => {
                    Clipboard.setString(message)
                    Toasts.open({ content: "Copied data to clipboard", source: getAssetId("toast_copy_link") })
                }}
            />
            <Text selectable style={{ fontFamily: Constants.Fonts.CODE_SEMIBOLD, fontSize: 12, backgroundColor: "#282b30", color: "white", marginTop: 5, padding: 12 }}>
                {message}
            </Text>
        </ScrollView>
    </>)
}
