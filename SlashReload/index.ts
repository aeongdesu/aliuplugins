import { Plugin } from "aliucord/entities";
// @ts-ignore
import { Dialog, ReactNative } from "aliucord/metro";

export default class SlashReload extends Plugin {
    public async start() {
        this.commands.registerCommand({
            name: "reload",
            description: "Reload Discord",
            options: [],
            execute: () => {
                // I have to use dialog because it crashes
                Dialog.show({
                    title: "Reload confirm",
                    body: "Are you sure you want to reload the discord app? This might crash your app instead of reloading it.",
                    confirmText: 'Yes',
                    cancelText: 'No',
                    isDismissable: false,
                    onConfirm: ReactNative.NativeModules.BundleUpdaterManager.reload
                });
            }
        });
    }
}