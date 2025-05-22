import { state } from "./state";

setInterval(() => {
    state.publishUserState();
}, 1000);