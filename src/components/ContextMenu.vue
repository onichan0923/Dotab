<template>
  <div v-if="visible" class="context-menu context-menu-content" :style="{ top: `${y}px`, left: `${x}px` }" @click.stop>
    <ul>
      <li @click="emit('edit', shortcut)"><span class="font-icon"></span>&nbsp;&nbsp; Edit</li>
      <li @click="emit('delete', shortcut)"><span class="font-icon"></span>&nbsp;&nbsp; Delete</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Shortcut } from '../stores/shortcuts'

defineProps<{
  visible: boolean
  x: number
  y: number
  shortcut: Shortcut | null
}>()

const emit = defineEmits(['close', 'edit', 'delete'])
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.context-menu {
  position: fixed;
  background-color: var(--context-menu-bg-color);
  border-radius: 10px;
  border: 0.5px solid var(--search-border-color, #d2d3d6); // 设计稿边框
  box-shadow: $contextMenu-shadow;
  padding: 0;
  z-index: 1000;
  min-width: 140px;
  backdrop-filter: blur(10px);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    border-radius: 8px;
    margin: 2px 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary-color);

    &:hover {
      background-color: var(--context-menu-hover-bg-color);
    }

    &:active {
      background-color: var(--context-menu-hover-bg-color);
    }

    &::before {
      margin-right: 8px;
    }
  }

  li:first-child {
    margin-top: 4px;
  }

  li:last-child {
    margin-bottom: 4px;
  }
}
</style>
