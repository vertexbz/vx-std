/**
 * Re-maps a number (x) from one (in) range to another (out). That is, a value of inMin would get mapped to outMin,
 * a value of inMax to outMax, values in-between to values in-between, etc.
 */
export const map = (inMin: number, inMax: number, outMin: number, outMax: number) => (x: number) => {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};
