// @ts-ignore
import { React, ReactNative, getByProps, Clipboard, Toasts, Constants, Forms } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"

import ViewRaw from "./index"

const Button = getByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default as any
const { ScrollView, TouchableOpacity } = ReactNative
const { FormText } = Forms

export default function RawPage() {
    const message = JSON.stringify(ViewRaw.message, null, 4)
    return (<>
        <ScrollView>
            <TouchableOpacity onLongPress={() => {
                Clipboard.setString(message)
                Toasts.open({ content: "Copied Raw data to clipboard", source: getAssetId("toast_copy_link") })
            }}>
                <FormText style={{ fontFmaily: Constants.Fonts.CODE_SEMIBOLD, fontSize: 12 }}>
                    {message}
                </FormText>
            </TouchableOpacity>
        </ScrollView>
    </>)
}