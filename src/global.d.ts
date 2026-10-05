declare global {
    interface ScreenOrientation extends EventTarget {
        lock(orientation: "any" | "landscape" | "natural" | "portrait" | "landscape-primary" | "landscape-secondary" | "portrait-primary" | "portrait-secondary" | OrientationLockType): Promise < void > ;
    }
}
export {};