import { validateOrigin } from 'editor-mathfield/utils';
import { getCommandTarget } from 'editor/commands';
import {
  AlphabeticKeyboardLayout,
  OriginValidator,
  VirtualKeyboardDefinition,
  VirtualKeyboardLayer,
  VirtualKeyboardToolbarOptions,
} from '../public/options';
import type {
  VirtualKeyboardMessage,
  VirtualKeyboardInterface,
  MathfieldProxy,
  VirtualKeyboardMessageAction,
} from './types';

export const VIRTUAL_KEYBOARD_MESSAGE = 'mathlive#virtual-keyboard-message';

export function isVirtualKeyboardMessage(
  evt: Event
): evt is MessageEvent<VirtualKeyboardMessage> {
  if (evt.type !== 'message') return false;
  const msg = evt as MessageEvent<VirtualKeyboardMessage>;

  if (msg.data?.type !== VIRTUAL_KEYBOARD_MESSAGE) return false;
  return true;
}
/**
 * The `VirtualKeyboardProxy` singleton is used when inside an
 * iframe (a non-top level browsing context).
 *
 * It relays messages to the top level `VirtualKeyboard` instance.
 */
// prettier-ignore
export class VirtualKeyboardProxy
  implements VirtualKeyboardInterface, EventTarget {
  private static _singleton: VirtualKeyboardProxy;
  static get singleton(): VirtualKeyboardProxy {
    if (!this._singleton) this._singleton = new VirtualKeyboardProxy();
    return this._singleton;
  }

  targetOrigin = globalThis.origin;
  originValidator: OriginValidator = 'same-origin';

  private readonly listeners: {
    [type: string]: Set<EventListenerOrEventListenerObject | null>;
  };

  private _boundingRect: DOMRect;

  constructor() {
    window.addEventListener('message', this);
    this.sendMessage('proxy-created');
  }
  set virtualKeyboards(value: string) {
    this.sendMessage('update-setting', { virtualKeyboards: value });
  }
  set virtualKeyboardLayout(value: AlphabeticKeyboardLayout) {
    this.sendMessage('update-setting', { virtualKeyboardLayout: value });
  }
  set customVirtualKeyboards(
    value:
      | {
          layers: Record<string, string | Partial<VirtualKeyboardLayer>>;
          keyboards: Record<string, VirtualKeyboardDefinition>;
        }
      | null
      | undefined
  ) {
    this.sendMessage('update-setting', {
      customVirtualKeyboards: structuredClone(value),
    });
  }
  set virtualKeyboardToolbar(value: VirtualKeyboardToolbarOptions) {
    this.sendMessage('update-setting', { virtualKeyboardToolbar: value });
  }

  set virtualKeyboardContainer(value: HTMLElement | null) {
    throw new Error('Container inside an iframe cannot be changed');
  }

  show(): void {
    this.sendMessage('show');
  }

  hide(): void {
    this.sendMessage('hide');
  }

  get visible(): boolean {
    return this._boundingRect.height > 0;
  }

  set visible(value: boolean) {
    if (value) this.show();
    else this.hide();
  }

  get boundingRect(): DOMRect {
    return this._boundingRect;
  }

  executeCommand(command: string | [string, ...any[]]): boolean {
    this.sendMessage('execute-command', command);
    return true; // true = dirty
  }

  updateToolbar(mf: MathfieldProxy): void {
    this.sendMessage('update-toolbar', mf);
  }

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    _options?: AddEventListenerOptions | boolean
  ): void {
    if (!this.listeners[type]) this.listeners[type] = new Set();
    if (!this.listeners[type].has(callback)) this.listeners[type].add(callback);
  }

  dispatchEvent(event: Event): boolean {
    if (!this.listeners[event.type] || this.listeners[event.type].size === 0)
      return true;
    this.listeners[event.type].forEach((x) => {
      if (typeof x === 'function') x(event);
      else x?.handleEvent(event);
    });
    return !event.defaultPrevented;
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    _options?: EventListenerOptions | boolean
  ): void {
    if (this.listeners[type]) this.listeners[type].delete(callback);
  }

  handleEvent(evt: Event): void {
    if (isVirtualKeyboardMessage(evt)) {
      if (!validateOrigin(evt.origin, this.originValidator)) {
        throw new DOMException(
          `Message from unknown origin (${evt.origin}) cannot be handled`,
          'SecurityError'
        );
      }

      const { action } = evt.data;
      if (action === 'execute-command') {
        const { command } = evt.data;

        // Avoid an infinite messages loop if within one window
        const commandTarget = getCommandTarget(command!);
        if (commandTarget !== 'virtual-keyboard' && window === window.parent)
          return;

        this.executeCommand(command!);
        return;
      }

      if (action === 'synchronize-proxy') {
        this._boundingRect = evt.data.boundingRect;
        return;
      }

      if (action === 'geometry-changed') {
        this._boundingRect = evt.data.boundingRect;
        this.dispatchEvent(new Event('geometrychange'));
        return;
      }
    }
  }

  private sendMessage(
    action: VirtualKeyboardMessageAction,
    payload: any = {}
  ): void {
    window.top?.postMessage(
      {
        type: VIRTUAL_KEYBOARD_MESSAGE,
        action,
        ...payload,
      },
      this.targetOrigin
    );
  }
}