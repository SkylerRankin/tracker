import { logsEnabled } from "./Constants";

export function log(...args) {
    if (logsEnabled) {
        console.log(...args);
    }
}