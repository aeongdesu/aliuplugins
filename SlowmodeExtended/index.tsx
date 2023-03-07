import { Plugin } from "aliucord/entities"
// @ts-ignore
import { Constants } from "aliucord/metro"

export default class SlowmodeExtended extends Plugin {
    public async start() {
        let values: number[] = []
        for (let i = 0; i <= 60; i++) {
            values.push(i)
        }
        for (let i = 120; i <= 3600; i++) {
            if (i % 60 == 0) values.push(i)
        }
        for (let i = 7200; i <= 21600; i++) {
            if (i % 3600 == 0) values.push(i)
        }
        Constants.SLOWMODE_VALUES = values
    }
}
