import { Plugin } from 'aliucord/entities';
import { FluxDispatcher, UserStore } from 'aliucord/metro';

export default class BypassNSFW extends Plugin {
  public async start() {
    if (UserStore.getCurrentUser()) {
      const user = UserStore.getCurrentUser();
      user.nsfwAllowed = true
    } else {
      try {
        const handleConnect = () => {
          FluxDispatcher.unsubscribe("CONNECTION_OPEN", handleConnect);
          const user = UserStore.getCurrentUser();
          user.nsfwAllowed = true
        }
        FluxDispatcher.subscribe("CONNECTION_OPEN", handleConnect);
      } catch (error) {
        this.logger.error((error as Error).stack)
      }
    }
  }
}
