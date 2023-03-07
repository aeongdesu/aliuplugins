import { Plugin } from "aliucord/entities"
// @ts-ignore
import { UserStore, Dialog, getByProps } from "aliucord/metro"
// @ts-ignore
import { restartApp } from "aliucord/native"
import { after, instead } from "aliucord/utils/patcher"

export default class BypassNSFW extends Plugin {
  public async start() {
    const NSFWStuff = getByProps("isNSFWInvite")
    instead(NSFWStuff, "handleNSFWGuildInvite", () => false)
    instead(NSFWStuff, "isNSFWInvite", () => false)
    instead(NSFWStuff, "shouldNSFWGateGuild", () => false)
    
    after(UserStore, "getCurrentUser", (_, user) => {
      if (user?.hasOwnProperty("nsfwAllowed")) {
        user.nsfwAllowed = true
      }
      return user
    })
  }
  public stop() {
    return Dialog.show({
      title: "Wait!",
      body: `Disabling ${this.name} requires a restart - would you like to do that now?`,
      confirmText: "Sure",
      cancelText: "Not now",
      onConfirm: () => restartApp()
    })
  }
}
