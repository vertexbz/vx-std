import { msFromDate, msFromTime } from '../time';
import { ConstructorArgTypes } from '../type';

export class ImmutableDate extends Date {
    static of(...args: ConstructorArgTypes<typeof ImmutableDate>) {
        return new ImmutableDate(...args);
    }

    clone(time?: number) {
        // $FlowIgnore
        const date = new ImmutableDate(this);
        if (typeof time === 'number') {
            date.setTime(time);
        }

        return date;
    }

    addMilliseconds(milliseconds: number) {
        return this.clone(this.getTime() + milliseconds);
    }

    subtractMilliseconds(milliseconds: number) {
        return this.clone(this.getTime() - milliseconds);
    }

    subtractDate(years: number, months: number, days: number) {
        return this.subtractMilliseconds(msFromDate(years, months, days));
    }

    subtractTime(hours: number, minutes: number, seconds: number) {
        return this.subtractMilliseconds(msFromTime(hours, minutes, seconds));
    }
}
