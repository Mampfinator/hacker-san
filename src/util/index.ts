import { getCallbackRegistry, getName } from "../callbacks/Callback"

export const makeCallbackTypeList = () => {
    const callbacks = getCallbackRegistry();
    return [...callbacks].map(callback => getName(callback));
}