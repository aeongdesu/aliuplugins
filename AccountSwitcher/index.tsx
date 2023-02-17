import { Plugin } from "aliucord/entities";
import { getAssetId } from "aliucord/utils";
// @ts-ignore
import { disablePlugin } from "aliucord/api"
// @ts-ignore
import { Toasts, getByProps } from "aliucord/metro";

export default class AccountSwitcher extends Plugin {
    public async start() {
        const config = getByProps("MultiAccountMobileExperiment").MultiAccountMobileExperiment.getCurrentConfig();
        if (!config.isMultiAccountMobileEnabled) {
            config.isMultiAccountMobileEnabled = true;
            Toasts.open({ content: "AccountSwitcher is now enabled!"})
            disablePlugin("AccountSwitcher");
        } else {
            this.logger.info("Already enabled AccountSwitcher experiment, disabling plugin...")
            Toasts.open({ content: "Already enabled!", source: getAssetId("Small")})
            disablePlugin("AccountSwitcher");
        }
    }
}
