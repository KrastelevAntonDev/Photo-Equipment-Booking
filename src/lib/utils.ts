export default function delay(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            resolve();
        }, ms);
    });
}
