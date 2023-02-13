import { Plugin } from "aliucord/entities";
// @ts-ignore
import { disablePlugin } from "aliucord/api"
import { getByProps } from "aliucord/metro";

export default class AccountSwitcher extends Plugin {
    public async start() {
        const config = getByProps("MultiAccountMobileExperiment").MultiAccountMobileExperiment.getCurrentConfig();
        if (!config.isMultiAccountMobileEnabled) {
            config.isMultiAccountMobileEnabled = true;
            disablePlugin("AccountSwitcher");
        } else {
            this.logger.info("Already enabled MultiAccount experiment, stopping..")
            disablePlugin("AccountSwitcher");
        }
    }
}
