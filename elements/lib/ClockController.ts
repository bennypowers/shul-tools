import type { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";

function isReactiveElement(host: ReactiveControllerHost): host is ReactiveElement {
  return typeof (host.constructor as typeof ReactiveElement).getPropertyOptions === 'function';
}

export class ClockController<T extends ReactiveControllerHost> implements ReactiveController {
  #host: ReactiveControllerHost;

  #date: Date;

  #key: keyof T;

  #ticking = false;

  #lastSecond = -1;

  #reactiveElementHost?: ReactiveElement;

  get date(): Date {
    return this.#date;
  }

  constructor(
    host: T,
    key?: keyof T,
  ) {
    this.#host = host;
    if (isReactiveElement(this.#host))
      this.#reactiveElementHost = this.#host
    this.#key = key,
    host.addController(this)
    this.start();
  }

  #tick = () => {
    const last = this.#lastSecond
    if (last !== (this.#lastSecond = new Date().getSeconds()))
      this.#update();
    if (this.#ticking)
      requestAnimationFrame(this.#tick)
  }

  #update() {
    this.#date = new Date();
    if (this.#reactiveElementHost)
      this.#reactiveElementHost.requestUpdate(this.#key, null);
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
    this.#ticking = true;
    this.#tick();
  }

  stop() {
    this.#ticking = false;
  }

  hostConnected(): void {
    this.stop();
    this.start();
  }

  hostDisconnected(): void {
    this.stop();
  }
}
