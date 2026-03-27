import { getUi5PropertyMetadata, isUi5ElementTarget } from "./ui5-metadata";

const unsupportedBindingWarnings = new Set<string>();

let warningsInstalled = false;
let getUnsupportedBindingWarningsEnabled = () => true;

const warnUnsupportedBinding = (
  tagName: string,
  attributeName: string,
  propertyName: string,
): void => {
  const key = `${tagName}:${attributeName}`;
  if (unsupportedBindingWarnings.has(key)) {
    return;
  }

  unsupportedBindingWarnings.add(key);
  console.warn(
    `[koppajs-ui5] ${tagName.toLowerCase()} property "${propertyName}" does not have stable declarative ` +
      "attribute support in UI5 Web Components. v0 only guarantees primitive and stringifiable bindings. " +
      "Use refs for complex JS-only values.",
  );
};

const shouldWarnForAttributeBinding = (
  element: HTMLElement,
  attributeName: string,
): { propertyName: string } | null => {
  if (
    !getUnsupportedBindingWarningsEnabled() ||
    !isUi5ElementTarget(element) ||
    element.isConnected
  ) {
    return null;
  }

  const propertyInfo = getUi5PropertyMetadata(element, attributeName);
  if (!propertyInfo) {
    return null;
  }

  const propertyType = propertyInfo.metadata.type;
  const hasComplexType = propertyType === Object || propertyType === Array;

  if (propertyInfo.supportsAttributeBinding && !hasComplexType) {
    return null;
  }

  return {
    propertyName: propertyInfo.propertyName,
  };
};

export const installUnsupportedBindingWarnings = (
  getEnabled: () => boolean,
): void => {
  getUnsupportedBindingWarningsEnabled = getEnabled;

  if (warningsInstalled || typeof Element === "undefined") {
    return;
  }

  warningsInstalled = true;

  const nativeSetAttribute = Element.prototype.setAttribute;

  Element.prototype.setAttribute = function patchedSetAttribute(name, value) {
    const warning = shouldWarnForAttributeBinding(this as HTMLElement, name);
    if (warning) {
      warnUnsupportedBinding(
        (this as HTMLElement).tagName,
        name,
        warning.propertyName,
      );
    }

    return nativeSetAttribute.call(this, name, value);
  };
};

export const resetUnsupportedBindingWarningsForTests = (): void => {
  unsupportedBindingWarnings.clear();
  getUnsupportedBindingWarningsEnabled = () => true;
};
