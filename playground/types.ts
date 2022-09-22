import type { Component } from 'vue';

export interface Example {
  title: string;
  id: string;
  code?: string;
  component: Component;
}

export interface DemoItemMetaData {
  text: string;
}
