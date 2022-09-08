import type { Component } from 'vue';

export interface Example {
  title: string;
  id: string;
  templateCode?: string;
  scriptCode?: string;
  component: Component;
}

export interface DemoItemMetaData {
  text: string;
}
