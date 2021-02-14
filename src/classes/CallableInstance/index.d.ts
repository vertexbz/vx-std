// eslint-disable-next-line no-use-before-define
export declare const CallableInstance: ICallableInstance;
export interface ICallableInstance<A = any, T = any> {
	new (property: string | symbol): (...argv: A[]) => T;
	(...argv: A[]): T;
}
export default CallableInstance;
