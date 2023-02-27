import { Plugin } from "aliucord/entities"
// @ts-ignore
import { FluxDispatcher, UserStore, Dialog } from "aliucord/metro"
// @ts-ignore
import { restartApp } from "aliucord/native"

export default class BypassNSFW extends Plugin {
  public async start() {
    const toAllow = () => {
      const user = UserStore.getCurrentUser()
      user.nsfwAllowed = true
    }

    if (UserStore.getCurrentUser()) toAllow()
    else {
      try {
        const handle = () => {
          FluxDispatcher.unsubscribe("CONNECTION_OPEN", handle)
          toAllow()
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
      body: "Disabling BypassNSFW requires a restart - would you like to do that now?",
      confirmText: "Sure",
      cancelText: "Not now",
      onConfirm: () => restartApp()
    })
  }
}
