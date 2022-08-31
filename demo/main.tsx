import { createApp, defineComponent } from 'vue';
import { SelectableItems } from '../src';
import { customItem, item, itemGroup } from '../src/functions';

const items = [
  item('Hello this is item but not item yes btw'),
  customItem('Custom item', {
    slotName: 'momento',
  }),
  itemGroup([
    item('Hello this is item 2'), //
    itemGroup([
      customItem(
        {
          onClick: console.log.bind(console, 'Hello guys'),
          text: 'Bruhos momentos',
        },
        { slotName: 'bruhos' },
      ),
    ]),
  ]),
];

const App = defineComponent({
  render() {
    return (
      <div>
        Welcome to the app
        <hr />
        <br />
        <SelectableItems
          onSelect={console.log}
          items={items}
          v-slots={{
            render: (text: string) => <div class="my-item">{text}</div>,
            momento: (text: string) => <small>{text}</small>,
            bruhos: ({ onClick, text }: { onClick: () => void; text: string }) => (
              <button
                type="button"
                onClick={onClick}
              >
                {text}
              </button>
            ),
          }}
        />
      </div>
    );
  },
});

const app = createApp(App);
app.mount('#app');
