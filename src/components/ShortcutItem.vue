<template>
  <a :href="shortcut.url" class="shortcut-item-wrapper context-menu-trigger" :class="{ 'persist-active': isClicked }"
    @click="handleClick" @contextmenu.prevent="$emit('contextmenu', $event)" draggable="false">
    <div class="shortcut-icon-container">
      <img v-if="displayFaviconUrl" :src="displayFaviconUrl" :alt="shortcut.name" @error="onFaviconError"
        class="favicon-img" draggable="false" />
      <div v-else class="favicon-placeholder">
        {{ shortcut.name.substring(0, 1).toUpperCase() }}
      </div>
    </div>
    <span class="shortcut-name">{{ shortcut.name }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Shortcut } from '../stores/shortcuts'

const props = defineProps<{
  shortcut: Shortcut
}>()

defineEmits(['contextmenu'])

const faviconLoadFailed = ref(false)
const isClicked = ref(false)

const handleClick = () => {
  isClicked.value = true
  // Optional: if you want the link to still navigate,
  // you might need to manually trigger navigation if event.preventDefault() was used elsewhere
  // or ensure this click handler doesn't prevent default navigation.
  // For a simple <a> tag, it should navigate by default.
}

const defaultFaviconServiceUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128` // Request larger favicon
  } catch (error) {
    console.warn(`Invalid URL for favicon: ${url}`, error)
    return ''
  }
}

const displayFaviconUrl = computed(() => {
  if (faviconLoadFailed.value) return ''
  if (props.shortcut.customFavicon) {
    return props.shortcut.customFavicon
  }
  if (!props.shortcut.url) return ''
  return defaultFaviconServiceUrl(props.shortcut.url)
})

const onFaviconError = (event: Event) => {
  // Prevent broken image icon, fallback to placeholder
  ; (event.target as HTMLImageElement).style.display = 'none' // Hide broken image
  // Or better, trigger placeholder by setting faviconLoadFailed,
  // but need to ensure placeholder is visible when img is hidden.
  // For simplicity, we'll rely on the v-else for placeholder.
  // To re-trigger placeholder, we need to make displayFaviconUrl return empty.
  faviconLoadFailed.value = true
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.shortcut-item-wrapper {
  outline: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: $shortcut-wrapper-width;
  padding: 14px 0;
  text-decoration: none;
  cursor: default;
  user-select: none;
  border-radius: 20px;
  background-color: transparent;
  transition:
    transform 0.15s ease-out,
    filter 0.15s ease-out,
    background-color 0.1s ease-out;

  &:hover {
    transform: scale(1.03);
    filter: brightness(1.05);
    background-color: $shortcutItem-bg-hover; // 使用变量

    .shortcut-icon-container {
      box-shadow: $shortcutItem-shadow; // 增强阴影
    }
  }

  &:active {
    transform: scale(0.97);
    filter: brightness(0.95);
    transition-duration: 0.05s;

    .shortcut-icon-container {
      border: 2px solid var(--accent-color); // 使用 CSS 变量
    }
  }

  &.persist-active {
    filter: brightness(0.95);
    background-color: $shortcutItem-bg-hover; // 使用变量
    transform: scale(0.97);
    transition-duration: 0.05s;

    .shortcut-icon-container {
      border: 2px solid var(--accent-color); // 使用 CSS 变量
    }
  }
}

.shortcut-icon-container {
  @include flex-center;
  width: $shortcut-icon-container-size; // 设计稿尺寸
  height: $shortcut-icon-container-size; // 设计稿尺寸
  background: var(--shortcut-icon-bg-color); // 使用 CSS 变量
  box-shadow:
    0px 1px 4px 0px rgba(0, 0, 0, 0.12),
    0px 4px 16px 0px rgba(39, 49, 74, 0.1);
  border-radius: 20px; // 设计稿圆角
  border: 0.5px var(--search-border-color) solid; // 使用 CSS 变量
  transition:
    transform 0.15s ease-out,
    box-shadow 0.15s ease-out,
    border 0.08s ease-out,
    background-color 0.3s ease; // 添加 background-color 过渡
  flex-shrink: 0;
  overflow: hidden; // 确保内部图片圆角生效
  pointer-events: none;


  .favicon-img {
    width: 35.7px; // 设计稿图标尺寸
    height: 35.7px; // 设计稿图标尺寸
    border-radius: 8px; // 设计稿图标圆角
    object-fit: cover;
    pointer-events: none;
  }

  .favicon-placeholder {
    font-size: 24px; // 调整占位符字体大小
    color: var(--text-primary-color); // 使用 CSS 变量
  }
}

.shortcut-name {
  text-align: center;
  color: var(--shortcut-name-text-color); // 使用 CSS 变量
  font-size: 12.5px; // 设计稿字体大小
  font-weight: 500; // 设计稿字重
  word-wrap: break-word;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; // 如果需要单行显示
  pointer-events: none;
}
</style>
