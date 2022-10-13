<script lang="ts" setup>
import { computed, ref } from 'vue';
import TheSidebar from './components/TheSidebar.vue';
import examples from './examples';

const activeExampleId = ref(examples[0].id);
const activeExample = computed(() =>
  examples.find((example) => example.id === activeExampleId.value),
);

function handleClickSourceCode(link: string) {
  window.open(link, '_blank');
}
</script>

<template>
  <TheSidebar
    v-model:activeExample="activeExampleId"
    :examples="examples"
    @clickSourceCode="handleClickSourceCode"
  />

  <div class="site-container">
    <div class="site-content">
      <Component
        :key="activeExampleId"
        :is="activeExample?.component"
      />
    </div>
  </div>
</template>
