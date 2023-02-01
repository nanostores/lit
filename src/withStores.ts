/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement } from "lit";
import { Store } from "nanostores";
import { MultiStoreController } from "./MultiStoreController";

/**
 * A mixin that subscribes a LitElement to a list of atoms.
 * @mixin `withStores`
 * @param LitElementClass The LitElement class to extend.
 * @param atoms The atoms to subscribe to.
 *
 * @example
 * ```ts
 * import { LitElement, html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 * import { atom } from 'nanostores';
 * import { withStores } from '@nanostores/lit';
 *
 * const count = atom(0);
 *
 * @customElement('my-element')
 * class MyElement extends withStores(LitElement, [count]) {
 *  render() {
 *   return html\`Count: \${count.get()}\`;
 *  }
 * }
 * ```
 */
export const withStores = <
  TLitElementClass extends new (...args: any[]) => LitElement,
  TAtoms extends Array<Store<unknown>>
>(
  LitElementClass: TLitElementClass,
  atoms: TAtoms
) => {
  return class LitElementWithStores extends LitElementClass {
    constructor(...args: any[]) {
      super(...args);
      new MultiStoreController(this, atoms);
    }
  } as (new (...args: any[]) => LitElement) & TLitElementClass;
};
