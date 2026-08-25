export const seededRandomIndex = (seed: number, max: number): number => {
    const x = Math.sin(seed) * 10000;
    const fraction = x - Math.floor(x);
    return Math.floor(fraction * max);
}