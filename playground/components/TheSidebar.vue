<script lang="ts" setup>
import type { Example } from '../types';

interface Props {
  examples?: Example[];
  activeExample: string;
}

interface Emits {
  (e: 'updateActiveExample', id: string): void;
}

withDefaults(defineProps<Props>(), { examples: () => [] });
const emit = defineEmits<Emits>();

function handleItemClick(example: Example) {
  emit('updateActiveExample', example.id);
}
</script>

<template>
  <ul class="_sidebar">
    <li
      v-for="example in examples"
      :key="example.id"
      @click="() => handleItemClick(example)"
    >
      {{ example.title }}
    </li>
  </ul>
</template>

<style lang="scss" scoped>
._sidebar {
  width: var(--sidebar-width);
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background-color: var(--bg-3);
}
</style>
