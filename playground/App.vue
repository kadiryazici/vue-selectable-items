<script lang="ts" setup>
import { ref } from 'vue';
import TheSidebar from './components/TheSidebar.vue';
import examples from './examples';

const activeExample = ref(examples[0].id);
</script>

<template>
  <TheSidebar
    v-model:activeExample="activeExample"
    :examples="examples"
  />

  <div class="site-container">
    <div class="site-content">
      <Component :is="examples.find((example) => example.id === activeExample)?.component" />
    </div>
  </div>
</template>
