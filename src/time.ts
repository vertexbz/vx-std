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

export const msFromTime = (hours: number, minutes: number, seconds: number) =>
    (1000 * 60 * 60 * hours) +
    (1000 * 60 * minutes) +
    (1000 * seconds);

export const msFromDate = (years: number, months: number, days: number) =>
    (86400000 * 31 * 12 * years) +
    (86400000 * 31 * months) +
    (86400000 * days);

/**
 * Return unix timestamp (current timezone)
 */
export const getUnixTime = (): number => Math.floor(Date.now() / 1000);

/**
 * Return unix timestamp (UTC)
 */
export const getUtcUnixTime = (): number => {
    const offset = (new Date()).getTimezoneOffset() * 60;
    return Math.floor(Date.now() / 1000) + offset;
};

/**
 * Get UTC Date object
 */
export const getUtcDate = (): Date => {
    return new Date((new Date()).toUTCString());
};

/**
 * Convert stringified date back to Date object
 * @param text
 */
export const textToDate = (text: string) => new Date(Date.parse(text));
