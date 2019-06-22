// @flow
export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const MONTH = DAY * 31;
export const YEAR = DAY * 365;

// eslint-disable-next-line complexity
const unitToValue = (unit: string) => {
    switch (unit) {
        case 's': return SECOND;
        case 'm': return MINUTE;
        case 'h': return HOUR;
        case 'd': return DAY;
        case 'w': return WEEK;
        case 'M': return MONTH;
        case 'y': return YEAR;
        default:
            throw new Error(`Unknown unit ${unit}!`);
    }
};

export const parseUnits = (str: string) => str
    .replace(/\s*([0-9]+)([smhdwMy])\s*/g, (_, val, unit) => `${parseFloat(val) * unitToValue(unit)} `)
    .trim()
    .split(' ')
    .map(parseFloat)
    .reduce((a, b) => a + b, 0);
