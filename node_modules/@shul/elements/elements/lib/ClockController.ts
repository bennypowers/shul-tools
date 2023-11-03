import type { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";

function isReactiveElement(host: ReactiveControllerHost): host is ReactiveElement {
  return typeof (host.constructor as typeof ReactiveElement).getPropertyOptions === 'function';
}

export class ClockController<T extends ReactiveControllerHost> implements ReactiveController {
  #host: ReactiveControllerHost;

  #interval?: number;

  #date: Date;

  #key: keyof T;

  get date(): Date {
    return this.#date;
  }

  constructor(
    host: T,
    key?: keyof T,
  ) {
    this.#host = host;
    this.#key = key,
    host.addController(this)
    this.start();
  }

  #tick = () => {
    this.#date = new Date();
    if (isReactiveElement(this.#host))
      this.#host.requestUpdate(this.#key, null);
    else
      this.#host.requestUpdate();
  }

  set(date: Date) {
    this.#date = date;
  }

  reset() {
    this.stop();
    this.#date = undefined;
  }

  start() {
    this.#interval = window.setInterval(this.#tick, 1000);
    this.#tick();
  }

  stop() {
    if (this.#interval)
      window.clearInterval(this.#interval)
    this.#interval = undefined;
  }

  hostConnected(): void {
    this.stop();
    this.start();
  }

  hostDisconnected(): void {
    this.stop();
  }
}
