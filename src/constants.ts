export const ItemTypes = {
  Custom: Symbol(),
  Item: Symbol(),
  Group: Symbol(),
} as const;

export enum HookType {
  Focus,
  Unfocus,
  Select,
  DOMFocus,
}

export const DEFAULT_ITEM_SLOT_NAME = 'render';

const libName = 'vue-selectable-items';
export const ClassNames = {
  Wrapper: libName,
  Item: `${libName}-item`,
  Focused: `${libName}-item-focused`,
  Disabled: `${libName}-item-disabled`,
} as const;
