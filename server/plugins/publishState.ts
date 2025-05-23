import { state } from "../utils/state";

export default defineNitroPlugin(async (_) => {
    let prevState: string | undefined = undefined;
    setInterval(() => {
        if (import.meta.dev) {
            const newUserState = JSON.stringify(state, (key, value) => key === "peer" ? "peer" : value, 2);
            if (newUserState !== prevState) {
                console.log(newUserState);
                prevState = newUserState;
            }
        }
        state.updateTimers();
        state.publishGameStates();
    }, 1000);
});