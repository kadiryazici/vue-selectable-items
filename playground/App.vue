<script lang="ts" setup>
import TheSidebar from './components/TheSidebar.vue';
import examples from './examples';

const Keyboard = examples[0].component;
</script>

<template>
  <TheSidebar
    :activeExample="'sdsad'"
    :examples="examples"
  />

  <div class="site-container">
    <div class="site-content">
      <Keyboard />
    </div>
  </div>
</template>
