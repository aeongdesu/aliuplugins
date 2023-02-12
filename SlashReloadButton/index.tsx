import { findInReactTree, getAssetId } from "aliucord/utils";
import { before, after } from "aliucord/utils/patcher";
import { Plugin } from "aliucord/entities";
// @ts-ignore
import { Dialog, ReactNative, Forms, React, getByName, Locale } from "aliucord/metro";

export default class SlashReloadButton extends Plugin {
    public async start() {
        this.commands.registerCommand({
            name: "reload",
            description: "Reload Discord",
            options: [],
            execute: () => ReactNative.NativeModules.BundleUpdaterManager.reload()
        });
        // stole from https://github.com/Aliucord/AliucordRN/blob/main/src/patches/patchSettings.tsx
        const patchUI = () => {
            const { FormRow } = Forms;
            const UserSettingsOverviewWrapper = getByName("UserSettingsOverviewWrapper", { default: false });

            const unpatch = after(UserSettingsOverviewWrapper, "default", (_, res) => {
                const Overview = findInReactTree(res, m => m.type?.name === "UserSettingsOverview");

                after(Overview.type.prototype, "render", (res, { props }) => {
                    const { children } = props;
                    const searchable = [Locale.Messages["BILLING_SETTINGS"], Locale.Messages["PREMIUM_SETTINGS"]];
                    const index = children.findIndex(x => searchable.includes(x.props.title));
                    children.splice(index === -1 ? 4 : index, 0, <>
                        <FormRow
                            leading={<FormRow.Icon source={getAssetId("ic_sync_24px")} />}
                            label="Reload Discord"
                            onPress={() => Dialog.show({
                                title: "Reload confirm",
                                body: "Are you sure you want to reload the discord app? This might crash your app instead of reloading it.",
                                confirmText: 'Yes',
                                cancelText: 'No',
                                isDismissable: false,
                                onConfirm: ReactNative.NativeModules.BundleUpdaterManager.reload
                            })}
                        />
                    </>)
                });

                unpatch();
            });
        }
        patchUI();
    }
}
