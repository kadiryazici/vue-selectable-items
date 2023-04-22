import { beforeEach, describe, vi, expect, it } from 'vitest';
import {
  createItemDefaults,
  item,
  filterSelectableAndCustomItems,
  filterSelectableItems,
  customItem,
  itemGroup,
} from '../src/index';
import { nanoid } from 'nanoid';
import { createTextVNode, FunctionalComponent, h, Slot } from 'vue';
import { mount } from '@vue/test-utils';
import SelectableItems, { Context } from '../src/Component';

const mockItems = [
  item({
    key: nanoid(),
    meta: 'Item 1',
  }),
  item({
    key: nanoid(),
    meta: 'Item 2',
  }),
  item({
    key: nanoid(),
    meta: 'Item 3',
  }),
];

describe('main tests', () => {
  const onItemFocusSpy = vi.fn();
  const onItemUnfocusSpy = vi.fn();
  const onItemDOMFocusSpy = vi.fn();
  const onSelectSpy = vi.fn();

  const mockFns = [onItemFocusSpy, onItemUnfocusSpy, onItemDOMFocusSpy, onSelectSpy];
  const resetFnMocks = () => mockFns.forEach((fn) => fn.mockReset());

  const createDefaultWrapper = ({
    props = {},
    slots = {},
  }: {
    props?: Partial<InstanceType<typeof SelectableItems>['$props']>;
    slots?: Record<string, Slot>;
  } = {}) =>
    mount(SelectableItems, {
      props: {
        items: mockItems,
        onItemFocus: onItemFocusSpy,
        onItemUnfocus: onItemUnfocusSpy,
        onItemDOMFocus: onItemDOMFocusSpy,
        onSelect: onSelectSpy,
        ...props,
      },
      slots: {
        render: (meta) => createTextVNode(meta),
        ...slots,
      },
    });

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    resetFnMocks();
  });

  it('should test events', async () => {
    const wrapper = createDefaultWrapper();

    expect(onItemFocusSpy).not.toHaveBeenCalled();
    expect(onItemUnfocusSpy).not.toHaveBeenCalled();
    expect(onItemDOMFocusSpy).not.toHaveBeenCalled();
    expect(onSelectSpy).not.toHaveBeenCalled();

    const items = wrapper.findAll('.vue-selectable-items-item');

    expect(items.length).toBe(3);

    await items[0].trigger('mouseenter');

    expect(onItemFocusSpy).toHaveBeenCalled();
    expect(onItemUnfocusSpy).not.toHaveBeenCalled();
    expect(onItemDOMFocusSpy).not.toHaveBeenCalled();
    expect(onSelectSpy).not.toHaveBeenCalled();

    resetFnMocks();

    await items[1].trigger('mouseenter');

    expect(onItemFocusSpy).toHaveBeenCalled();
    expect(onItemUnfocusSpy).toHaveBeenCalled();
    expect(onItemDOMFocusSpy).not.toHaveBeenCalled();
    expect(onSelectSpy).not.toHaveBeenCalled();

    resetFnMocks();

    await items[1].trigger('click');

    expect(onItemFocusSpy).not.toHaveBeenCalled();
    expect(onItemUnfocusSpy).not.toHaveBeenCalled();
    expect(onItemDOMFocusSpy).not.toHaveBeenCalled();
    expect(onSelectSpy).toHaveBeenCalled();

    resetFnMocks();

    await items[1].trigger('focus');

    expect(onItemFocusSpy).not.toHaveBeenCalled();
    expect(onItemUnfocusSpy).not.toHaveBeenCalled();
    expect(onItemDOMFocusSpy).toHaveBeenCalled();
    expect(onSelectSpy).not.toHaveBeenCalled();
  });

  it('should test context', async () => {
    let context: Context;

    const wrapper = createDefaultWrapper({
      props: {
        setup: (ctx) => (context = ctx),
      },
    });

    expect(context).not.toBe(undefined);

    context.onFocus(onItemFocusSpy);
    context.onDOMFocus(onItemDOMFocusSpy);
    context.onSelect(onSelectSpy);
    context.onUnfocus(onItemUnfocusSpy);

    context.focusNext();

    expect(onItemFocusSpy).toHaveBeenCalled();
    expect(onItemUnfocusSpy).not.toHaveBeenCalled();
    expect(onItemDOMFocusSpy).not.toHaveBeenCalled();
    expect(onSelectSpy).not.toHaveBeenCalled();

    context.selectFocusedItem();
    expect(onSelectSpy).toHaveBeenCalled();
    expect(context.getFocusedItemElement()).toBeInstanceOf(HTMLElement);
    expect(context.getFocusedItemElement().classList.contains('vue-selectable-items-item')).toBe(
      true,
    );

    const itemWrapper = wrapper.findAll('.vue-selectable-items-item');
    await itemWrapper[/* current item */ 0].trigger('focus');
    expect(onItemDOMFocusSpy).toHaveBeenCalled();

    resetFnMocks();

    context.clearFocus();
    expect(onItemUnfocusSpy).toHaveBeenCalled();
    context.focusNext();
    expect(context.getFocusedItem()?.key).toBe(mockItems[0].key);
    context.focusPrevious();
    expect(context.getFocusedItem()?.key).toBe(mockItems[2].key);
    context.focusNext();
    expect(context.getFocusedItem()?.key).toBe(mockItems[0].key);

    {
      const items = [mockItems[1], mockItems[2]];
      await wrapper.setProps({ items });

      expect(context.getFocusedItem()).toBe(undefined);

      context.setFocusByIndex(1);
      expect(context.getFocusedItem()?.key).toBe(items[1].key);
    }

    {
      const itemOnSelectSpy = vi.fn();
      const items = [
        item({
          key: 'nanoid',
          meta: 'Item -1',
          disabled: true,
          onSelect: itemOnSelectSpy,
        }),
        ...mockItems,
      ];

      await wrapper.setProps({ items });
      resetFnMocks();

      context.focusNext();
      expect(context.getFocusedItem()?.key).toBe(items[1].key);
      expect(itemOnSelectSpy).not.toHaveBeenCalled();

      context.focusPrevious();
      expect(context.getFocusedItem()?.key).toBe(items[items.length - 1].key);
      expect(itemOnSelectSpy).not.toHaveBeenCalled();

      items[0].disabled = false;
      await wrapper.setProps({ items });
      context.clearFocus();
      context.focusNext();
      context.selectFocusedItem();
      expect(itemOnSelectSpy).toHaveBeenCalled();
    }
  });

  async function testItemDefaults(useCallback = false) {
    const items = [
      item({
        key: 'q',
        meta: 'Item 1',
        elementAttrs: {
          name: 'kadir',
        },
        elementTag: 'button',
      }),
      item({
        key: 'w',
        meta: 'Item 2',
        elementAttrs: {
          name: 'kadir',
        },
        elementTag: 'button',
      }),
    ];

    const wrapper = createDefaultWrapper({
      props: { items },
    });

    expect(
      wrapper
        .findAll('.vue-selectable-items-item')
        .every((el) => el.element.getAttribute('name') === 'kadir'),
    ).toBe(true);

    const Wrapper: FunctionalComponent = (_props, { slots }) => h('div', null, slots.default());

    const defaultsObj = {
      wrapperComponentOrTag: Wrapper,
      wrapperProps: { class: 'wrapper-yes' },
      elementAttrs: {
        surname: 'yazici',
      },
      elementTag: 'span',
    };
    const defaults = createItemDefaults(useCallback ? () => defaultsObj : defaultsObj);

    await wrapper.setProps({ items, itemDefaults: defaults });

    expect(
      wrapper
        .findAll('.vue-selectable-items-item')
        .every(
          (el) =>
            el.element.getAttribute('name') === 'kadir' &&
            el.element.getAttribute('surname') === 'yazici',
        ),
    ).toBe(true);

    expect(
      wrapper
        .findAll('.vue-selectable-items-item') //
        .every(({ element }) => {
          const parent = element.parentElement;
          return parent.tagName === 'DIV' && parent.classList.contains('wrapper-yes');
        }),
    ).toBe(true);

    expect(
      wrapper
        .findAll('.vue-selectable-items-item') //
        .every(({ element }) => element.tagName === 'BUTTON'),
    ).toBe(true);
  }

  it('should test default options object', () => testItemDefaults());
  it('should test default options callback', () => testItemDefaults(true));

  it('should render nested array items properly', () => {
    const items = [
      [
        [
          [
            item({
              key: 'q',
              meta: 'Item 1',
              elementAttrs: {
                name: 'kadir',
              },
            }),
          ],
        ],
        item({
          key: 'qqww',
          meta: 'Item 2',
          elementAttrs: {
            name: 'kadir',
          },
        }),
      ],
    ];

    const wrapper = createDefaultWrapper({
      props: {
        items: [items],
      },
    });

    expect(
      wrapper
        .findAll('.vue-selectable-items-item')
        .every((el) => el.element.getAttribute('name') === 'kadir'),
    ).toBe(true);
  });

  it('should filter items correctly', () => {
    const items = [
      item({
        key: '1',
      }),
      item({
        key: '2',
      }),
      [
        item({
          key: '2',
        }),
        [
          item({
            key: '2',
          }),
          customItem({ key: 'qwe', name: 'momentos' }),
        ],
      ],
      [
        itemGroup({
          key: 'group',
          items: [[item({ key: '12332' })]],
        }),
      ],
    ];

    expect(filterSelectableAndCustomItems(items).length).toBe(6);
    expect(filterSelectableItems(items).length).toBe(5);
  });
});
