<script lang="ts">
const animOptions: KeyframeAnimationOptions = {
  duration: 200,
  easing: 'ease',
};

function handleIconAnimationEnter(el: HTMLElement, done: () => void) {
  const { width } = el.getBoundingClientRect();

  const animation = el.animate(
    [
      { width: `0px` }, //
      { width: `${width}px` },
    ],
    animOptions,
  );

  animation.onfinish = done;
}

function handleIconAnimationLeave(el: HTMLElement, done: () => void) {
  const { width } = el.getBoundingClientRect();

  const animation = el.animate(
    [
      { width: `${width}px` },
      { width: `0px` }, //
    ],
    animOptions,
  );

  animation.onfinish = done;
}
</script>

<script lang="ts" setup>
import IconCode from 'virtual:icons/carbon/code';

interface Emits {
  (e: 'clickSourceCode'): void;
}

interface Props {
  text: string;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
});
const emit = defineEmits<Emits>();
</script>

<template>
  <li
    class="_sidebar-item"
    :class="{ _active: props.active }"
  >
    <span class="_text">{{ props.text }}</span>
    <Transition
      @enter="handleIconAnimationEnter"
      @leave="handleIconAnimationLeave"
    >
      <span
        v-if="props.active"
        class="_code"
        @click="emit('clickSourceCode')"
      >
        <IconCode class="_code-icon" />
      </span>
    </Transition>
  </li>
</template>

<style lang="scss" scoped>
._sidebar-item {
  align-items: center;
  list-style: none;
  width: 100%;
  color: var(--txt-2);
  background-color: transparent;
  display: flex;
  flex-direction: row;
  cursor: default;

  &._active {
    color: var(--accent-1);

    ._text,
    ._code {
      &:hover {
        color: var(--accent);
      }
    }
  }

  ._code {
    flex-shrink: 0;
    height: 100%;
    display: inline-flex;
    border-radius: 10px;
    aspect-ratio: 1/1;
    overflow: hidden;

    &:hover {
      color: var(--txt-1);
      background-color: var(--bg-4);
    }
  }

  ._text {
    padding: 15px;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 16px;
    border-radius: 10px;

    &:hover {
      color: var(--txt-1);
      background-color: var(--bg-4);
    }
  }
}

._code-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin: auto;
}
</style>
