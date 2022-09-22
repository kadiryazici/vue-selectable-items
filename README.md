# Vue Selectable Items

[![npm](https://img.shields.io/npm/v/vue-selectable-items)](https://npmjs.com/package/vue-selectable-items)

This package only supports `Vue ^3.2.x`

Vue Selectable Items is item rendering/selecting engine, it has zero styling and minimal functioning and all of its parts are configurable.

## Installation

Install it with your favorite package manager

```
npm install vue-selectable-items
```

```
pnpm add vue-selectable-items
```

```
yarn add vue-selectable-items
```

## Usage

#### Import the component and functions to create items.

```html
<script setup>
  import { ref } from 'vue';
  import { SelectableItems, item, customItem, itemGroup };

  const items = [
    item({
      key: 'item-key-1',
      meta: { title: 'New York City' },
    }),
    customItem({
      key: 'label-1'
      meta: {
        onClick: () => doSomething(),
        someProp: 123
      },
      name: 'label'
    }),
    itemGroup({

    })
  ]
</script>

<template>
  <SelectableItems :items="items">
    <template #render="metaData"> {{ metaData.title }} </template>

    <template #label="metaData">
      <some-component v-bind="metaData" />
    </template>
  </SelectableItems>
</template>
```

Let's explain everything step by step.

#### SelectableItems

- Main item renderer component, you can render items however you want with slots.

- Props:

  ```ts
  interface SelectableItemProps {
    // Items for component to render/handle.
    items: (Item | ItemGroup | CustomItem)[];

    // If `true` given, SelectableItems will have no wrapper element,
    // just stack of items (Fragment).
    noWrapperElement?: booolean;

    // If you want to add setup specific things:
    // onMounted, Composables, Keyboard Handling (see examples) and more setup specific stuff.
    // NOTE: This function will only run once and won't track changes after setup.
    setup?: (context: SelectableItemsSetupContext) => void;
  }
  ```

- Emits:
  ```ts
  interface Emits {
    // When an item is selected, metaData of that item will be emitted with `select` event.
    select: (metaData: any) => void;
  }
  ```

#### item()

- Type

  ```ts
  function item<Meta = unknown>(options: ItemOptions<Meta>): Item<Meta>;
  ```

- Usage

  This is main function that creates a selectable item and will be rendered as `render` slot on component.

  You can store any `meta` data in it will be passed as scoped slot `<template #render="meta" />` for render use.

  Selectable items are always rendered by `render`.

  ```html
  <script setup>
    import { item } from 'vue-selectable-items'
    import { ref } from 'vue'

    const items = ref([
      item({
        key: 'my-item-unique-key',
        // Metadata, this will be accessable in slot data. You can give any value.
        meta: { title: 'Hello' }
        // You can specifiy item specific event handler, this will be called when this item selected.
        // NOTE: `select` emit will be called always.
        onSelect: (metaData) => console.log('Selected', metaData.title);
      })
    ]);
  </script>

  <template>
    <SelectableItems :items="items">
      <!-- 
      This slot will be called for each selectable item,
      so meta can be different for some items, it's up to you.
    -->
      <template #render="meta"> {{ meta.title }} </template>
    </SelectableItems>

    <!-- This is what above code renders to DOM -->
    <div class="vue-selectable-items">
      <!-- Items are always wrapped by a div. -->
      <div class="vue-selectable-item">Hello</div>
    </div>
  </template>
  ```

- Options

  ```ts
  item<Meta = unknown>(options: ItemOptions<Meta>): Item<Meta>;

  interface ItemOptions<
    Meta,
    WrapperComponentOrTag,
    ElementTag,

    WrapperProps = GetWrapperComponentOrTagProps<WrapperComponent>
    ElementAttrs = GetAttrs<ElementTag>
  > {
    /**
     * You can wrap this item with a Component or an element.
     * If you pass component, item will be rendered on `default` slot of given component.
     * If you pass string, that string will be used as tag. Pass `div, span` etc.
     */
    wrapperComponentOrTag?: WrapperComponentOrTag;

    /**
     * Given attrs/props will be passed to `wrapperComponentOrTag`
     * For example if you passed `Teleport`to `wrapperComponentOrTag` you can
     * pass `wrapperProps: { to: 'body' }`, and `Teleport` will use these props.
     */
    wrapperProps?: Props;

    /**
     * Tag of selectable element, by default it is `div.vue-selectable-item`
     * You can set a custom tag like `span`, `button` etc.
     */
    elementTag?: ElementTag;

    /**
     * Attrs that will be passed to selectable item.
     * For example if you set `elementTag` to a button, you can set it's type by passing
     * `elementAttrs: { type: 'submit' }`
     */
    elementAttrs?: ElementAttrs,

    // Item specific selection event.
    onSelect?: (meta: Meta) => void;
  }
  ```

#### customItem()

- Type

  ```ts
  function customItem<Meta>(options: CustomItemOptions<Meta>): CustomItem<Meta>;
  ```

- Usage

  Custom item provides a way to add `non-selectable` item like elements respected by queue.

  CustomItem doesn't have a wrapper element by default, what is given is rendered.

  You have to specify the slot name of customItem will be rendered to and meta will be passed as slot data.

  ```html
  <script setup>
    import { customItem } from 'vue-selectable-items'
    import { ref } from 'vue'

    const items = ref([
      customItem({
        key: 'sp3ci4lK€Y'
        meta: 'Cities'
        name: 'label'
      })
    ]);

    const realWorldExample = ref([
      customItem({
        key: 'label:toyota',
        meta: 'Toyota',
        name: 'label'
      }),
      item({
        key: 'corolla',
        meta: { name: 'Corolla' }
      }),
      item({
        key: 'supra',
        meta: { name: 'Supra' }
      }),

      customItem({
        key: 'label:volkswagen',
        meta: 'Volkswagen',
        name: 'label'
      }),
      item({
        key: 'golf',
        meta: { name: 'Golf' }
      }),
      item({
        key: 'id5'
        meta: { name: 'ID.5'  }
      }),
    ]);
  </script>

  <template>
    <SelectableItems :items="items">
      <!-- 
      This slot will be called for each custom item that has `label` as name.
    -->
      <template #label="title">
        <h5>{{ title }}</h5>
      </template>
    </SelectableItems>

    <!-- This is what above code renders to DOM -->
    <div class="vue-selectable-items">
      <h5>Cities</h5>
    </div>
  </template>
  ```

- Options

  ```ts
  function customItem<Meta>(options: CustomItemOptions<Meta>): CustomItem<Meta>;

  interface CustomItemOptions {
    meta: Meta;
    /**
     * This custom item will be rendered in given name as slotName.
     */
    name: string;
  }
  ```

#### itemGroup()

- Type

  ```ts
  function itemGroup<WrapperComponent>(
    options?: ItemGroupOptions<WrapperComponent>,
  ): ItemGroup<WrapperComponent>;
  ```

- Usage

  itemGroup is a way to group items under a structure. By default `itemGroup` has no effect on render but if `wrapperComponentOrTag` field is set itemGroup's all items will be rendered in given wrapper component.

  Items of `itemGroup` will be rendered by given order.

  ```html
  <script setup>
    import { itemGroup, customItem, item } from 'vue-selectable-items'
    import GroupWrapper from './GroupWrapper.vue'
    import { ref } from 'vue'

    const items = ref([
      customItem({
        key: 'cities:label',
        meta: 'Cities',
        name: 'label'
      }),

      item({
        key: 'greetingsItem',
        meta: 'Hello'
      }),

      itemGroup({
        key: 'my_item_group_and_needs_key',
        items: [
          item({
            key: 'question:how',
            meta: 'How are you?'
          }),
          customItem({
            key: 'label:countries',
            meta: 'Countries',
            name: 'label'
          }),
          item({
            key: 'mySpecialItem'
            meta: {
              text: 'New York',
              type: 'something'
            },
          })
        ],
        wrapperComponentOrTag: GroupWrapper,
        wrapperProps: {
          title: 'Suggested Selections'
        }
      })
    ]);
  </script>

  <template>
    <SelectableItems :items="items">
      <!-- 
      This slot will be called for each custom item that has `label` as name.
    -->
      <template #label="title">
        <h5>{{ title }}</h5>
      </template>

      <template #render="data">
        <template v-if="typeof data === 'string'"> {{ data }} </template>

        <template v-else>
          <span> {{ data.text }} </span>
          <span> {{ data.type }} </span>
        </template>
      </template>
    </SelectableItems>

    <!-- This is what the code above renders to DOM -->
    <div class="vue-selectable-items">
      <h5>Cities</h5>

      <div class="vue-selectable-items-item">Hello</div>

      <!-- Think it like rendered component -->
      <GroupWrapper title="Suggested Selections">
        <div class="vue-selectable-items-item">How are you?</div>

        <h5>Countries</h5>

        <div class="vue-selectable-items-item">
          <span> New York</span>
          <span> something </span>
        </div>
      </GroupWrapper>
    </div>
  </template>
  ```

  You can nest itemGroups infinitely.

  ```ts
  const items = [
    itemGroup([
      itemGroup([customItem(), itemGroup([item(), customItem(), itemGroup([...enough])])]),
    ]),
  ];
  ```

- Options

  ```ts
  function itemGroup(
    items: (Item | CustomItem | ItemGroup)[],
    options?: ItemGroupOptions,
  ): ItemGroup;

  interface ItemGroupOptions {
    /**
     * You can wrap this group with a Component or an element.
     * If you pass component, items will be rendered on `default` slot of given component.
     * If you pass string, that string will be used as tag. Pass `div, span` etc.
     */
    wrapperComponentOrTag?: Component | string;

    /**
     * Given attrs/props will be passed to `wrapperComponentOrTag`
     * For example if you passed `Teleport`to `wrapperComponentOrTag` you can
     * pass `wrapperProps: { to: 'body' }`, and `Teleport` will use these props.
     */
    wrapperProps?: Record<string, unknown>;
  }
  ```

## Notes

- Never pass single item reference more than once, each item should be unique, if you do, change the key! Duplicate keys will cause errors.

  ```ts
  const myItem = item({
    key: 'my_itemov',
    meta: 'My Item',
  });

  const items = [
    myItem,
    itemGroup({
      key: 'group1',
      items: [myItem],
    }),
  ];

  console.log(items);
  /*
      {
        key: 'my_itemov',
      },
      {
        items: [
          {
            key: 'my_itemov' // DUPLICATE FOUND
          }
        ]
      }
    */
  ```

- To get the best type support for `item()` and `itemGroup()` while defining `wrapperComponentOrTag` and `elementTag` as `string` use `as const`.

  Following images will show the difference.

  ## Without `as const`

  ![without const](https://raw.githubusercontent.com/kadiryazici/vue-selectable-items/main/images/no-type-div.png)

  ## With `as const`

  ![without const](https://raw.githubusercontent.com/kadiryazici/vue-selectable-items/main/images/with-type-div.png)
