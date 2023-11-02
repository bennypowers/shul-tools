import type { LitElement, PropertyValues } from 'lit';
type PropertyKeys<T> = Parameters<PropertyValues<T>['get']>[0];
type WrapperMethod<T, Args extends any[]> = (this: T, ...args: Args) => void;
export declare function observes<T extends LitElement, Key extends PropertyKeys<T>, Args extends [old: T[Key]]>(key: Key): (original: WrapperMethod<T, Args>, context: ClassMethodDecoratorContext<T, WrapperMethod<T, Args>>) => () => any;
export {};
