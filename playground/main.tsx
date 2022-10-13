import { createApp } from 'vue';
import './styles/index.scss';
import 'wowerlay/dist/style.css';
import App from './App.vue';
import examples from './examples';

const app = createApp(App);
app.mount('#app');

console.log({ examples });
