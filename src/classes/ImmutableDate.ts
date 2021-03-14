import { msFromDate, msFromTime } from '../time';
import type { ConstructorArgTypes } from '../type';

export class ImmutableDate extends Date {
    public static of(...args: ConstructorArgTypes<typeof ImmutableDate>) {
        return new ImmutableDate(...args);
    }

    public clone(time?: number) {
        const date = new ImmutableDate(this);
        if (typeof time === 'number') {
            date.setTime(time);
        }

        return date;
    }

    public addMilliseconds(milliseconds: number) {
        return this.clone(this.getTime() + milliseconds);
    }

    public subtractMilliseconds(milliseconds: number) {
        return this.clone(this.getTime() - milliseconds);
    }

    public subtractDate(years: number, months: number, days: number) {
        return this.subtractMilliseconds(msFromDate(years, months, days));
    }

    public subtractTime(hours: number, minutes: number, seconds: number) {
        return this.subtractMilliseconds(msFromTime(hours, minutes, seconds));
    }
}
