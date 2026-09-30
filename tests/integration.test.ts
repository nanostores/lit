// @vitest-environment jsdom

import { html, LitElement } from "lit";
import { atom } from "nanostores";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiStoreController } from "../src/MultiStoreController";
import { StoreController } from "../src/StoreController";
import { useStores } from "../src/useStores";
import { withStores } from "../src/withStores";

function createHost() {
	return {
		addController: vi.fn(),
		removeController: vi.fn(),
		requestUpdate: vi.fn(),
		updateComplete: Promise.resolve(true),
	};
}

afterEach(() => {
	document.body.replaceChildren();
});

describe("StoreController", () => {
	it("updates on changes while connected, stops after disconnect, and reconnects once", () => {
		const count = atom(0);
		const host = createHost();
		const controller = new StoreController(host, count);
		expect(host.addController).toHaveBeenCalledWith(controller);
		expect(controller.value).toBe(0);

		controller.hostConnected();
		host.requestUpdate.mockClear(); // nanostores calls subscribe immediately
		count.set(1);
		expect(controller.value).toBe(1);
		expect(host.requestUpdate).toHaveBeenCalledTimes(1);

		controller.hostDisconnected();
		host.requestUpdate.mockClear();
		count.set(2);
		expect(host.requestUpdate).not.toHaveBeenCalled();

		controller.hostConnected();
		host.requestUpdate.mockClear();
		count.set(3);
		expect(host.requestUpdate).toHaveBeenCalledTimes(1);
	});
});

describe("MultiStoreController", () => {
	it("tracks each store and releases both subscriptions on disconnect", () => {
		const first = atom(0);
		const second = atom("a");
		const host = createHost();
		const controller = new MultiStoreController(host, [first, second] as const);
		expect(host.addController).toHaveBeenCalledWith(controller);
		expect(controller.values).toEqual([0, "a"]);

		controller.hostConnected();
		host.requestUpdate.mockClear();
		first.set(1);
		second.set("b");
		expect(controller.values).toEqual([1, "b"]);
		expect(host.requestUpdate).toHaveBeenCalledTimes(2);

		controller.hostDisconnected();
		host.requestUpdate.mockClear();
		first.set(2);
		second.set("c");
		expect(host.requestUpdate).not.toHaveBeenCalled();

		controller.hostConnected();
		host.requestUpdate.mockClear();
		first.set(3);
		second.set("d");
		expect(controller.values).toEqual([3, "d"]);
		expect(host.requestUpdate).toHaveBeenCalledTimes(2);
	});
});

describe("component helpers", () => {
	it("useStores subscribes and reconnects a LitElement", async () => {
		const first = atom(0);
		const second = atom(10);
		class Counter extends LitElement {
			render() {
				return html`${first.get()}/${second.get()}`;
			}
		}
		const ConnectedCounter = useStores(first, second)(Counter);
		customElements.define("test-use-stores-counter", ConnectedCounter);
		const element = document.createElement(
			"test-use-stores-counter",
		) as InstanceType<typeof ConnectedCounter>;
		document.body.append(element);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("0/10");
		first.set(1);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("1/10");
		second.set(11);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("1/11");
		element.remove();
		const update = vi.spyOn(element, "requestUpdate");
		first.set(2);
		second.set(12);
		expect(update).not.toHaveBeenCalled();
		update.mockRestore();
		document.body.append(element);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("2/12");
	});

	it("withStores subscribes and reconnects a LitElement", async () => {
		const first = atom(0);
		const second = atom(10);
		class Counter extends withStores(LitElement, [first, second]) {
			render() {
				return html`${first.get()}/${second.get()}`;
			}
		}
		customElements.define("test-with-stores-counter", Counter);
		const element = document.createElement(
			"test-with-stores-counter",
		) as Counter;
		document.body.append(element);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("0/10");
		first.set(1);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("1/10");
		second.set(11);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("1/11");
		element.remove();
		const update = vi.spyOn(element, "requestUpdate");
		first.set(2);
		second.set(12);
		expect(update).not.toHaveBeenCalled();
		update.mockRestore();
		document.body.append(element);
		await element.updateComplete;
		expect(element.shadowRoot?.textContent).toBe("2/12");
	});
});
