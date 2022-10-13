<script lang="ts" setup>
import type { Example } from '../types';
import TheSidebarItem from './TheSidebarItem.vue';

interface Props {
  examples?: Example[];
  activeExample: string;
}

interface Emits {
  (e: 'update:activeExample', id: string): void;
  (e: 'clickSourceCode', link: string): void;
}

const props = withDefaults(defineProps<Props>(), { examples: () => [] });
const emit = defineEmits<Emits>();

function handleItemClick(example: Example) {
  emit('update:activeExample', example.id);
}
</script>

<template>
  <ul class="_sidebar">
    <TheSidebarItem
      v-for="example in props.examples"
      :key="example.id"
      :text="example.title"
      :active="props.activeExample === example.id"
      @click="() => handleItemClick(example)"
      @clickSourceCode="$emit('clickSourceCode', example.repoLink)"
    />
  </ul>
</template>

<style lang="scss" scoped>
._sidebar {
  padding: 10px;
  width: var(--sidebar-width);
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background-color: var(--bg-3);
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow-y: scroll;
}
</style>
