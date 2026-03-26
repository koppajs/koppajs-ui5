import {
  getUi5EventNames,
  isUi5ElementTarget,
  normalizeUi5EventAliasToken,
} from "./ui5-metadata";

const UI5_EVENT_ALIAS_PREFIX = "ui5";

let bridgeInstalled = false;
let getUi5CustomEventsEnabled = () => true;
const unresolvedEventWarnings = new Set<string>();
let ui5AttributeObservers = new WeakMap<HTMLElement, MutationObserver>();
let boundUi5AttributeListeners = new WeakMap<
  HTMLElement,
  Map<string, { eventType: string; handler: EventListener }>
>();

const warnUnresolvedEventAlias = (tagName: string, aliasType: string): void => {
  const key = `${tagName}:${aliasType}`;
  if (unresolvedEventWarnings.has(key)) {
    return;
  }

  unresolvedEventWarnings.add(key);
  console.warn(
    `[koppajs-ui5] Could not resolve UI5 event alias "${aliasType}" for ${tagName.toLowerCase()}. ` +
      "Use the onUi5<EventName> convention only with real UI5 custom events.",
  );
};

const resolveUi5CustomEventTypeByAliasToken = (
  target: EventTarget,
  aliasToken: string,
): string | null => {
  if (!getUi5CustomEventsEnabled()) {
    return null;
  }

  if (!isUi5ElementTarget(target) || !aliasToken) {
    return null;
  }

  const actualEventType = getUi5EventNames(target).find(
    (eventName) => normalizeUi5EventAliasToken(eventName) === aliasToken,
  );

  return actualEventType ?? null;
};

const resolveUi5CustomEventType = (
  target: EventTarget,
  type: string,
): string | null => {
  if (
    !type.startsWith(UI5_EVENT_ALIAS_PREFIX) ||
    type.includes("-") ||
    type.length <= UI5_EVENT_ALIAS_PREFIX.length
  ) {
    return null;
  }

  const aliasToken = type.slice(UI5_EVENT_ALIAS_PREFIX.length);
  const actualEventType = resolveUi5CustomEventTypeByAliasToken(
    target,
    aliasToken,
  );

  if (!actualEventType && isUi5ElementTarget(target)) {
    warnUnresolvedEventAlias(target.tagName, type);
  }

  return actualEventType;
};

const getComponentEventHandler = (
  host: HTMLElement,
  handlerName: string,
): EventListener | null => {
  const instance = (
    host as HTMLElement & {
      instance?: {
        userContext?: Record<string, unknown>;
        methods?: Record<string, unknown>;
      };
    }
  ).instance;

  const handler =
    instance?.userContext?.[handlerName] ?? instance?.methods?.[handlerName];

  return typeof handler === "function" ? (handler as EventListener) : null;
};

const bindUi5AttributeListenersForElement = (
  host: HTMLElement,
  element: HTMLElement,
): void => {
  const bindings = boundUi5AttributeListeners.get(element) ?? new Map();
  const activeAttributeNames = new Set(
    element
      .getAttributeNames()
      .filter((attributeName) => attributeName.startsWith("onui5")),
  );

  for (const [attributeName, existingBinding] of bindings) {
    if (activeAttributeNames.has(attributeName)) {
      continue;
    }

    element.removeEventListener(
      existingBinding.eventType,
      existingBinding.handler,
    );
    bindings.delete(attributeName);
  }

  for (const attributeName of activeAttributeNames) {
    const handlerName = element.getAttribute(attributeName)?.trim();
    if (!handlerName) {
      continue;
    }

    const actualEventType = resolveUi5CustomEventTypeByAliasToken(
      element,
      attributeName.slice("onui5".length),
    );
    const handler = getComponentEventHandler(host, handlerName);

    if (!actualEventType || !handler) {
      continue;
    }

    const existingBinding = bindings.get(attributeName);
    if (
      existingBinding &&
      existingBinding.eventType === actualEventType &&
      existingBinding.handler === handler
    ) {
      continue;
    }

    if (existingBinding) {
      element.removeEventListener(
        existingBinding.eventType,
        existingBinding.handler,
      );
    }

    element.addEventListener(actualEventType, handler);
    bindings.set(attributeName, {
      eventType: actualEventType,
      handler,
    });
  }

  if (bindings.size > 0) {
    boundUi5AttributeListeners.set(element, bindings);
  }
};

const bindUi5AttributeListenersForHost = (host: HTMLElement): void => {
  if (!getUi5CustomEventsEnabled() || !host.isConnected) {
    return;
  }

  const ui5Elements = Array.from(host.querySelectorAll("*")).filter(
    (node): node is HTMLElement => isUi5ElementTarget(node),
  );

  for (const element of ui5Elements) {
    bindUi5AttributeListenersForElement(host, element);
  }
};

export const installUi5CustomEventBridge = (
  getEnabled: () => boolean,
): void => {
  getUi5CustomEventsEnabled = getEnabled;

  if (bridgeInstalled || typeof EventTarget === "undefined") {
    return;
  }

  bridgeInstalled = true;

  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  const nativeRemoveEventListener = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.addEventListener = function patchedAddEventListener(
    type,
    listener,
    options,
  ) {
    const resolvedType =
      typeof type === "string"
        ? (resolveUi5CustomEventType(this, type) ?? type)
        : type;

    return nativeAddEventListener.call(this, resolvedType, listener, options);
  };

  EventTarget.prototype.removeEventListener =
    function patchedRemoveEventListener(type, listener, options) {
      const resolvedType =
        typeof type === "string"
          ? (resolveUi5CustomEventType(this, type) ?? type)
          : type;

      return nativeRemoveEventListener.call(
        this,
        resolvedType,
        listener,
        options,
      );
    };
};

export const observeUi5CustomEventAttributes = (host: HTMLElement): void => {
  if (
    ui5AttributeObservers.has(host) ||
    typeof MutationObserver === "undefined"
  ) {
    return;
  }

  const observer = new MutationObserver(() => {
    bindUi5AttributeListenersForHost(host);
  });

  observer.observe(host, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  ui5AttributeObservers.set(host, observer);
  queueMicrotask(() => {
    bindUi5AttributeListenersForHost(host);
  });
};

export const resetUi5CustomEventBridgeStateForTests = (): void => {
  unresolvedEventWarnings.clear();
  getUi5CustomEventsEnabled = () => true;
  ui5AttributeObservers = new WeakMap();
  boundUi5AttributeListeners = new WeakMap();
};
