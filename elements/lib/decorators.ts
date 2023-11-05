import type { LitElement, PropertyValues, ReactiveControllerHost } from 'lit';
import { ClockController } from './ClockController.js';

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

type ClockContext<T extends ReactiveControllerHost> = ClassAccessorDecoratorContext<T, Date> & {
  metadata: DecoratorMetadataObject & {
    controller: ClockController<T>
  }
};

const access = new WeakMap<
  ReactiveControllerHost,
  ClockController<ReactiveControllerHost>
>();

export function clock<T extends ReactiveControllerHost>(
  original: ClassAccessorDecoratorTarget<T, Date>,
  context: ClassAccessorDecoratorContext<T, Date>
) {
  if (context.kind !== 'accessor')
    throw new Error('@clock must be applied to an accessor')
  if (typeof context.name !== 'string')
    throw new Error('@clock must be applied to a named member')
  context.addInitializer(function() {
    context.metadata.controller = new ClockController(this, context.name as keyof T);
    access.set(this, context.metadata.controller as ClockController<ReactiveControllerHost>);
  });
  return {
    get() {
      return (context as ClockContext<T>).metadata.controller?.date;
    },
    set(v: Date) {
      return (context as ClockContext<T>).metadata.controller?.set(v);
    }
  }
}

clock.reset = function(target: ReactiveControllerHost) {
  access.get(target).reset();
}
clock.start = function(target: ReactiveControllerHost) {
  access.get(target).start();
}
clock.stop = function(target: ReactiveControllerHost) {
  access.get(target).stop();
}
clock.set = function(target: ReactiveControllerHost, value: Date) {
  access.get(target).set(value);
}
