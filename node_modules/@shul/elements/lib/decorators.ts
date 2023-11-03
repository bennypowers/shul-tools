import type { LitElement, PropertyValues } from 'lit';

type PropertyKeys<T> = Parameters<PropertyValues<T>['get']>[0]

type WrapperMethod<T, Key extends keyof T> =
  (this: T, ...args: [Record<Key, T[Key]>]) => void;

export function observes<
  T extends LitElement,
  Key extends PropertyKeys<T>,
>(...keys: Key[]) {
  return function(
    original: WrapperMethod<T, Key>,
    context: ClassMethodDecoratorContext<T, WrapperMethod<T, Key>>
  ) {
    context.addInitializer(function() {
      // @ts-expect-error: i know its wrong but i don't mind
      const { willUpdate } = this; this.willUpdate = async function(changed: PropertyValues<this>) {
        await willUpdate?.call(this, changed);
        const changedEntries =
          [...changed.entries()]
            .filter(([k]) => keys.includes(k))
        if (changedEntries.length)
          original.call(this, Object.fromEntries(changedEntries));
      }
    });
    return () => void 0;
  }
}
