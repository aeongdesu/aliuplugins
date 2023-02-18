import { Plugin } from "aliucord/entities"
import { FluxDispatcher, UserStore } from "aliucord/metro"

export default class BypassNSFW extends Plugin {
  public async start() {
    const toAllow = () => {
      const user = UserStore.getCurrentUser()
      user.nsfwAllowed = true
    }

    if (UserStore.getCurrentUser()) toAllow()
    else {
      try {
        FluxDispatcher.subscribe("CONNECTION_OPEN", () => toAllow())
      } catch (error) {
        this.logger.error((error as Error).stack)
      }
    }
  }
}
