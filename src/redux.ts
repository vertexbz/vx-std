import { MagicObject } from './classes/MagicObject';
import { createCaseOf } from './object';

export interface Action {
    type: string
}

type ReducerCasesType<S, A> = {
    [key: string]: (state: S, action: A) => S
}

export const createReducer = <S, A extends Action>(cases: ReducerCasesType<S, A>, initialState: S) => {
    const reducers = createCaseOf(cases);

    return (state: S = initialState, action: A) => {
        const reducer = reducers(action.type);
        if (reducer) {
            return reducer(state, action);
        }
        return state;
    };
};

export class ActionStore extends MagicObject {
    constructor(mountPoint?: string) {
        // @ts-ignore
        return super(
            mountPoint ? (key) => mountPoint.toUpperCase() + ':' + key : (key) => key,
            (key) => key.toUpperCase()
        );
    }
}
