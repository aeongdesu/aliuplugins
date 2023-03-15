import { Plugin } from "aliucord/entities"
// @ts-ignore
import { getByProps } from "aliucord/metro"
import { after, instead } from "aliucord/utils/patcher"

export default class ClientTheme extends Plugin {
  public async start() {
    instead(getByProps("canUseClientThemes"), "canUseClientThemes", () => true)

    getByProps("ClientThemesExperiment").ClientThemesExperiment.getCurrentConfig().hasClientThemes = true
    getByProps("ClientThemesMobileExperiment").ClientThemesMobileExperiment.getCurrentConfig().hasClientThemes = true

    getByProps("_updateBackgroundGradientPresetId")._updateBackgroundGradientPresetId(getByProps("BackgroundGradientPresetId").BackgroundGradientPresetId["COTTON_CANDY"])

    getByProps("updateTheme").updateTheme("dark")
  }
}