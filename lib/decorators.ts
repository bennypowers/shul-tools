import type { LitElement, PropertyValues } from 'lit';

type PropertyKeys<T> = Parameters<PropertyValues<T>['get']>[0]

type WrapperMethod<T, Args extends any[]> = (this: T, ...args: Args) => void;

export function observes<
  T extends LitElement,
  Key extends PropertyKeys<T>,
  Args extends [old: T[Key]],
>(key: Key) {
  return function(
    original: WrapperMethod<T, Args>,
    context: ClassMethodDecoratorContext<T, WrapperMethod<T, Args>>
  ) {
    context.addInitializer(function() {
      // @ts-expect-error: i know its wrong but i don't mind
      const { willUpdate } = this; this.willUpdate = async function(changed: PropertyValues<this>) {
        await willUpdate?.call(this, changed);
        if (changed.has(key))
          original.call(this, changed.get(key));
      }
    });
    return () => void 0;
  }
}
