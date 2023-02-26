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
}
