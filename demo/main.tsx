import { createApp, defineComponent } from 'vue';
import { SelectableItems } from '../src';
import { customItem, item, itemGroup } from '../src/functions';

const items = [
  item('Hello this is item'),
  customItem('Custom item', {
    slotName: 'momento',
  }),
  itemGroup([
    item('Hello this is item 2'), //
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
          items={items}
          v-slots={{
            render: (text: string) => text,
            momento: (text: string) => <small>{text}</small>,
          }}
        />
      </div>
    );
  },
});

const app = createApp(App);
app.mount('#app');
