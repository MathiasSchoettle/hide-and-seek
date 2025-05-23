import { state } from "../utils/state";

export default defineNitroPlugin(async (_) => {
    setInterval(() => {
        state.publishGameStates();
    }, 1000);
});