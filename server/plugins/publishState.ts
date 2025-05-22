import { state } from "../utils/state";

export default defineNitroPlugin(async (_) => {
    setInterval(() => {
        state.publishUserState();
    }, 1000);
});