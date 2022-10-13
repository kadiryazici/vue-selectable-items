# 0.2.0

  - (Component): `itemFocus`, `itemUnfocus`, `itemDOMFocus`, `itemHover` emits are added.

  - (Component): `SelectableItems` component now exposes `Context` as template ref.

  - (Lib): Now all events has 3 arguments; Meta, Item and HTMLElement.

  - (Lib): New exported functions `filterSelectableAndCustomItems` and `filterSelectableItems`.

  - (Types): Now `onSelect` property of an item has correct type support.

- ### Breaking Changes
  - (Context): `getItemMetaDataByKey` renamed as `getItemMetaByKey` with generic support. `getItemMetabyKey<Meta = unknown>`

  - (Context): `getSelectableItems` now supports generic. `getSelectableItems<Meta = unknown>`

  - (Context): `getFocusedElement` renamed as `getFocusedItemElement`

  - (Context): `onMouseEnter` renamed as `onHover`

<br>

# 0.1.1

- Updated readme.

<br>

# 0.1.0

- `itemGroup()` and `item()` now wraps given `wrapperComponentOrTag` with `markRaw` for performance optimization.
- `itemGroup()` and `item()` now has type support for `wrapperProps`.
- `onClick(meta)` property of `item()` now has correct types.
- Added `data-vue-selectable-items-item` to selectable item elements to help users query items like `document.activeElement.hasAttribute('data-vue-selectable-items-item')`.

### Breaking Changes

- Now each item requires a unique key, old approach was creating a random key for each item but that wasn't a good choice because most people are creating items in a computed and computed creates unique key for each trigger. This makes all items to rerender even if they didn't change.

- itemGroup, customItem and item functions are now expecting 1 argument as object and has generic meta type support.

- `metaData` renamed to `meta` and.

- `slotName` option of `CustomItem` renamed as `name`.

<br>

# 0.0.2

- Added new functions to `setup` prop arguments.
- Exported missing types.
