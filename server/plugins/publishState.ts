import { state } from "../utils/state";

export default defineNitroPlugin(async (_) => {
    setInterval(() => {
        console.log(JSON.stringify(state, (key, value) => key === "peer" ? "peer" : value, 2));
        state.updateTimers();
        state.publishGameStates();
    }, 1000);
});