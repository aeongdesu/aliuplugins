import { Plugin } from 'aliucord/entities';
import { FluxDispatcher, UserStore } from 'aliucord/metro';

export default class BypassNSFW extends Plugin {
  public async start() {
    if (UserStore.getCurrentUser()) {
      const user = UserStore.getCurrentUser();
      user.nsfwAllowed = true
    } else {
      try {
        FluxDispatcher.subscribe("CONNECTION_OPEN", () => {
          const user = UserStore.getCurrentUser();
          user.nsfwAllowed = true
        });
      } catch (error) {
        this.logger.error((error as Error).stack)
      }
    }
  }
}
