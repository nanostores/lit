/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: Intentional */
/** biome-ignore-all lint/suspicious/noExplicitAny: This is safe */
import type { ReactiveControllerHost } from "lit";
import type { Store } from "nanostores";
import { MultiStoreController } from "./MultiStoreController";

/**
 * A TypeScript decorator that creates a new `MultiStoreController` for the atoms
 * @decorator `useStores(...atoms)`
 * @param atoms The atoms to subscribe to, as separate arguments (not an array).
 *
 * @example
 * ```ts
 * import { LitElement, html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 * import { atom } from 'nanostores';
 * import { useStores } from '@nanostores/lit';
 *
 * const count = atom(0);
 * const name = atom('Nano');
 *
 * @customElement('my-element')
 * @useStores(count, name)
 * class MyElement extends LitElement {
 *  render() {
 *   return html\`\${name.get()}: \${count.get()}\`;
 *   }
 * }
 * ```
 */
export function useStores<TAtoms extends Array<Store<unknown>>>(
	...atoms: TAtoms
) {
	return <TConstructor extends new (...args: any[]) => ReactiveControllerHost>(
		constructor: TConstructor,
	) => {
		return class extends constructor {
			constructor(...args: any[]) {
				super(...args);
				new MultiStoreController(this, atoms);
			}
		};
	};
}
