# Vue Selectable Items

[![npm](https://img.shields.io/npm/v/vue-selectable-items)](https://npmjs.com/package/vue-selectable-items)

This package only supports `Vue ^3.2.x`

Vue Selectable Items is a flexable and lightweight library that provides data oriented selectable item list. 

## Installation
Install it with your favorite package manager
```
npm install vue-selectable-items
````

```
pnpm add vue-selectable-items
````

```
yarn add vue-selectable-items 
```

## Usage
Vue Selectable Items by default has tiny render system and zero styling, everything is up to user of library.

#### Import the component and functions to create items.

```html
<script setup>
import { ref } from 'vue';
import { SelectableItems, item, customItem, itemGroup };

const items = [
  item({ title: 'New York City' }),
  customItem({
    onClick: () => doSomething(),
    someProp: 123
  }, { slotName: 'label' }),
  itemGroup([
    item({ title: 'Washington' })
  ], { wrapperComponent: MyItemWrapperComponent })
]
</script>

<template>
  <SelectableItems :items="items">
    <template #render="metaData">
      {{ metaData.title }}
    </template>

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
    interface SelectableItemProps  {
      // Items for component to render/handle.
      items: (Item | ItemGroup | CustomItem)[];

      // If `true` given, SelectableItems will have no wrapper element, 
      // just stack of items (Fragment).
      noWrapperElement?: booolean;

      // If you want to add setup specific things:
      // onMounted, Composables, Keyboard Handling (see examples) and more setup specific stuff.
      // NOTE: This function will only run once and won't track changes after setup.
      setup?: (context: SelectableItemsSetupContext) => void
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
    function item(metaData: unknown, options?: ItemOptions): Item;
    ```
  
  - Usage

    This is main function that creates a selectable item and will be rendered as `render` slot on component.

    You can store any `metaData` in first argument and it will be passed as scoped slot `<template #render="metaData" />` for render use.


    Selectable items are always rendered by `render`.

    ```html
    <script setup>
    import { item } from 'vue-selectable-items'
    import { ref } from 'vue'
    
    const items = ref([
      item(
        // Metadata, this will be accessable in slot data. You can give any value.
        { title: 'Hello' } 

        // Options, this will change or add behavior to rendered item.
        {
          // You can specifiy item specific event handler, this will be called when this item selected.
          // `select` emit will be called always.
          onSelect: (metaData) => console.log('Selected', metaData.title);
        } 
      )
    ]);
    </script>

    <template>
      <SelectableItems :items="items">
      <!-- 
        This slot will be called for each selectable item,
        so metaData can be different for some items, it's up to you.
      -->
        <template #render="metaData"> 
          {{ metaData.title }}
        </template>
      </SelectableItems>

      <!-- This is what above code renders to DOM -->
      <div class="vue-selectable-items">
        <!-- Items are always wrapped by a div. -->
        <div class="vue-selectable-item">
          Hello
        </div>
      </div>
    </template>
    ```

  - Options
    ```ts
    item(metaData: unknown, options: ItemOptions);

    interface ItemOptions {
      /**
       * You can wrap this item with a Component or an element.
       * If you pass component, item will be rendered on `default` slot of given component.
       * If you pass string, that string will be used as tag. Pass `div, span` etc.
       */
      wrapperComponentOrTag?: Component | string;

      /**
       * Given attrs/props will be passed to `wrapperComponentOrTag`
       * For example if you passed `Teleport`to `wrapperComponentOrTag` you can 
       * pass `wrapperProps: { to: 'body' }`, and `Teleport` will use these props.
       */
      wrapperProps?: Record<string, unknown>;

      /**
       * Tag of selectable element, by default it is `div.vue-selectable-item`
       * You can set a custom tag like `span`, `button` etc.
       */
      elementTag?: string;

      /**
       * Attrs that will be passed to selectable item.
       * For example if you set `elementTag` to a button, you can set it's type by passing
       * `elementAttrs: { type: 'submit' }`
       */
      elementAttrs?: {
        // NEVER PASS A KEY, IT CAN CAUSE ISSUES
        key?: undefined;

        // You can access to selectable element by giving a ref, any Vue specific attr/prop is available.
        ref?: Ref<HTMLElement | null | undefined>;
        [key: string]: unknown;
      };

      // Item specific selection event.
      onSelect?: (metaData: unknown) => void;
    }
    ```

#### customItem()
  - Type
    ```ts
    function customItem(metaData: unknown, options: CustomItemOptions): CustomItem;
    ```
  
  - Usage

    Custom item provides a way to add `non-selectable` item like elements respected by queue to list.

    CustomItem doesn't have a wrapper element by default, what is given is rendered.

    You have to specify what slotName the customItem will be rendered and metaData will be passed as slot data.

    ```html
    <script setup>
    import { customItem } from 'vue-selectable-items'
    import { ref } from 'vue'
    
    const items = ref([
      customItem('Cities', {
        slotName: 'label'
      })
    ]);

    const realWorldExample = ref([
      customItem('Toyota', { slotName: 'label' }),
      item({ name: 'Corolla' }),
      item({ name: 'Supra' }),

      customItem('Mercedes', { slotName: 'label' }),
      item({ name: 'Golf' }),
      item({ name: 'ID.5' }),
    ]);
    </script>

    <template>
      <SelectableItems :items="items">
      <!-- 
        This slot will be called for each custom item that has `label` as slotName.
      -->
        <template #label="title"> 
          <h5> {{ title }} </h5>
        </template>
      </SelectableItems>

      <!-- This is what above code renders to DOM -->
      <div class="vue-selectable-items">
        <h5> Cities </h5> 
      </div>
    </template>
    ```

  - Options
    ```ts
    customItem(metaData: unknown, options: CustomItemOptions);

    interface CustomItemOptions {
      /**
       * This custom item will be rendered to given slotName.
       */
      slotName: string;
    }
    ```

#### itemGroup()
  - Type
    ```ts
    function itemGroup(items: (Item | CustomItem | ItemGroup)[], options?: ItemGroupOptions): ItemGroup;
    ```
  
  - Usage

    itemGroup is a way to group items under a structure. By default `itemGroup` has no effect on render but `wrapperComponentOrTag` of itemGroup be set and all items in the group will be rendered inside given wrapper component.

    Items inside `itemGroup` will be selectable/rendered by given order.

    ```html
    <script setup>
    import { itemGroup, customItem, item } from 'vue-selectable-items'
    import GroupWrapper from './GroupWrapper.vue'
    import { ref } from 'vue'
    
    const items = ref([
      customItem('Cities', {
        slotName: 'label'
      }),

      item('Hello'),

      itemGroup(
        [
          item('How are you?'),
          customItem('Countries', { slotName: 'label' }),
          item({ text: 'New York', type: 'something' })
        ],
        {
          wrapperComponentOrTag: GroupWrapper,
          wrapperProps: {
            title: 'Suggested Selections'
          }
        }
      )
    ]);
    </script>

    <template>
      <SelectableItems :items="items">
      <!-- 
        This slot will be called for each custom item that has `label` as slotName.
      -->
        <template #label="title"> 
          <h5> {{ title }} </h5>
        </template>

        <template #render="data">
          <template v-if="typeof data === 'string'">
            {{ data }}
          </template>

          <template v-else>
            <span> {{ data.text }} </span>
            <span> {{ data.type }} </span>
          </template> 
        </template>
      </SelectableItems>

      <!-- This is what the code above renders to DOM -->
      <div class="vue-selectable-items">
        <h5> Cities </h5> 

        <div class="vue-selectable-items-item">
          Hello
        </div>

        <!-- Think it like rendered component -->
        <GroupWrapper title="Suggested Selections">
          <div class="vue-selectable-items-item">
            How are you?
          </div>
          
          <h5> Countries </h5>

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
        itemGroup([
          customItem(),
          itemGroup([
            item(),
            customItem(),
            itemGroup([...enough])
          ])
        ])
      ])
    ]
    ```

  - Options
    ```ts
    function itemGroup(items: (Item | CustomItem | ItemGroup)[], options?: ItemGroupOptions): ItemGroup;

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
  - Never pass single item reference twice, each item should be unique, because each item is created with a key and keys should be unique for each item. 
  ```ts
  const myItem = item('My Item');

  const items = [
    myItem,
    itemGroup([
      myItem
    ])
  ]

  console.log(items)
    /*
      {
        key: 'sd3dgbcsz',
      },
      {
        items: [
          {
            key: 'sd3dgbcsz' // DUPLICATE FOUND
          }
        ]
      }
    */
  ```