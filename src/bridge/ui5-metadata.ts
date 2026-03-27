type Ui5PropertyMetadata = {
  noAttribute?: boolean;
  type?: unknown;
};

type Ui5ElementMetadata = {
  getEvents?: () => Record<string, unknown>;
  getProperties?: () => Record<string, Ui5PropertyMetadata>;
  hasAttribute?: (propertyName: string) => boolean;
};

type Ui5ElementConstructor = {
  getMetadata?: () => Ui5ElementMetadata;
};

export const isBrowserHTMLElement = (value: unknown): value is HTMLElement =>
  typeof HTMLElement !== "undefined" && value instanceof HTMLElement;

export const isUi5ElementTarget = (value: unknown): value is HTMLElement =>
  isBrowserHTMLElement(value) && value.tagName.startsWith("UI5-");

export const getUi5ElementMetadata = (
  value: unknown,
): Ui5ElementMetadata | null => {
  if (!isUi5ElementTarget(value)) {
    return null;
  }

  const metadata = (value.constructor as Ui5ElementConstructor).getMetadata?.();
  return metadata ?? null;
};

export const kebabToCamelCase = (value: string): string =>
  value.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase());

export const normalizeUi5EventAliasToken = (value: string): string =>
  value.replace(/-/g, "").toLowerCase();

export const getUi5EventNames = (value: unknown): string[] =>
  Object.keys(getUi5ElementMetadata(value)?.getEvents?.() ?? {});

export const getUi5PropertyMetadata = (
  value: unknown,
  attributeName: string,
): {
  propertyName: string;
  metadata: Ui5PropertyMetadata;
  supportsAttributeBinding: boolean;
} | null => {
  const elementMetadata = getUi5ElementMetadata(value);
  const properties = elementMetadata?.getProperties?.();

  if (!properties) {
    return null;
  }

  const propertyName = kebabToCamelCase(attributeName);
  const metadata = properties[propertyName];

  if (!metadata) {
    return null;
  }

  return {
    propertyName,
    metadata,
    supportsAttributeBinding:
      elementMetadata?.hasAttribute?.(propertyName) ?? !metadata.noAttribute,
  };
};
