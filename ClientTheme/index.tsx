import { Plugin } from "aliucord/entities"
// @ts-ignore
import { Toasts, getByProps, FluxDispatcher, UserStore } from "aliucord/metro"

export default class ClientTheme extends Plugin {
    public async start() {
        const toEnable = () => {
            // enable experiment
            let config = getByProps("ClientThemesMobileExperiment").ClientThemesMobileExperiment.getCurrentConfig()
            config.hasClientThemes = true

            // fix client theme has reset after switching accounts
            getByProps("canUseClientThemes").canUseClientThemes = () => true

            // set custom theme after load discord (bg for now)
            // wip: save setting
            const { updateBackgroundGradientPreset } = getByProps("updateBackgroundGradientPreset")
            const { BackgroundGradientPresetId } = getByProps("BackgroundGradientPresetId")
            updateBackgroundGradientPreset(BackgroundGradientPresetId["CHROMA_GLOW"])
            // hmm
            const defaultTheme = getByProps("getThemeOnStart").getThemeOnStart()
            getByProps("updateTheme").updateTheme(defaultTheme)
        }
        if (UserStore.getCurrentUser()) toEnable()
        else {
          try {
            const handle = () => {
              FluxDispatcher.unsubscribe("CONNECTION_OPEN", handle)
              toEnable()
            }
            FluxDispatcher.subscribe("CONNECTION_OPEN", handle)
          } catch (e) {
            this.logger.error(e)
          }
        }
    }
}