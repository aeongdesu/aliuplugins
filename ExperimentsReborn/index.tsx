// stole from https://github.com/Beefers/strife/blob/master/plugins/Experiments/src/index.ts

import { Plugin } from "aliucord/entities"
// @ts-ignore
import { UserStore, getByProps, Dialog, FluxDispatcher, setAMOLEDThemeEnabled } from "aliucord/metro"
// @ts-ignore
import { restartApp } from "aliucord/native"

const { getSerializedState } = getByProps("getSerializedState")

export default class ExperimentsReborn extends Plugin {
    public async start() {
        const enable = () => {
            // Add 1 (staff) to local user flags
            UserStore.getCurrentUser().flags += 1

            // Filter for action handlers on event OVERLAY_INITIALIZE that have "Experiment" in their name
            const actionHandlers = UserStore._dispatcher._actionHandlers._computeOrderedActionHandlers("OVERLAY_INITIALIZE").filter(e => e.name.includes("Experiment"))

            // Call those action handlers with fake data
            for (let a of actionHandlers) {
                a.actionHandler({
                    serializedExperimentStore: getSerializedState(),
                    user: { flags: 1 },
                })
            }

            // Remove 1 from local user flags, removing staff badge but leaving experiments intact
            UserStore.getCurrentUser().flags -= 1

            const { setAMOLEDOption } = setAMOLEDThemeEnabled
            setAMOLEDOption()
        }


        if (UserStore.getCurrentUser()) enable()
        else {
            try {
                const handle = () => {
                    FluxDispatcher.unsubscribe("CONNECTION_OPEN", handle)
                    enable()
                }
                FluxDispatcher.subscribe("CONNECTION_OPEN", handle)
            } catch (e) {
                this.logger.error(e)
            }
        }
    }
    public stop() {
        return Dialog.show({
            title: "Wait!",
            body: "Disabling experiments requires a restart - would you like to do that now?",
            confirmText: "Sure",
            cancelText: "Not now",
            onConfirm: () => restartApp()
        })
    }
}