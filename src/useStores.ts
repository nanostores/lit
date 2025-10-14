/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: Intentional */
/** biome-ignore-all lint/suspicious/noExplicitAny: This is safe */
import type { ReactiveControllerHost } from "lit";
import type { Store } from "nanostores";
import { MultiStoreController } from "./MultiStoreController";

/**
 * A TypeScript decorator that creates a new `MultiStoreController` for the atoms
 * @decorator `withStores(atoms)`
 * @param atoms The atoms to subscribe to.
 *
 * @example
 * ```ts
 * import { LitElement, html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 * import { atom } from 'nanostores';
 * import { useStores } from '@nanostores/lit';
 *
 * const count = atom(0);
 *
 * @customElement('my-element')
 * @useStores(count)
 * class MyElement extends LitElement {
 *  render() {
 *   return html\`Count: \${count.get()}\`;
 *   }
 * }
 * ```
 */
export function useStores<TAtoms extends Store<unknown>>(
	...atoms: TAtoms[] | Array<TAtoms[]>
) {
	return <TConstructor extends new (...args: any[]) => ReactiveControllerHost>(
		constructor: TConstructor,
	) => {
		return class extends constructor {
			constructor(...args: any[]) {
				super(...args);
				new MultiStoreController(this, atoms.flat(Infinity));
			}
		};
	};
}
