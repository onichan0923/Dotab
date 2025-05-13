<template>
  <div class="new-tab-page">
    <div class="content-container">
      <UserGreeting />
      <SearchBox />
      <div class="shortcuts-grid">
        <template v-for="(shortcut, index) in shortcutsStore.shortcuts" :key="shortcut.id">
          <ShortcutItem :shortcut="shortcut" class="draggable-item" :class="{
            dragging: draggedShortcutId === shortcut.id,
            'drag-over': dragOverShortcutId === shortcut.id && draggedShortcutId !== shortcut.id
          }" draggable="true" @contextmenu.prevent="(event) => openContextMenu(event, shortcut)"
            @dragstart="handleDragStart(shortcut, index, $event)"
            @dragover.prevent="handleDragOver(shortcut, index, $event)" @dragleave="handleDragLeave()"
            @drop="handleDrop(shortcut, index, $event)" @dragend="handleDragEnd()" />
        </template>
        <AddShortcutButton @click="uiStore.openAddShortcutModal()" class="draggable-item" />
      </div>
    </div>
    <button class="settings-button btn btn--icon" @click="uiStore.openSettingsModal()"></button>

    <ModalDialog :is-open="uiStore.isAddShortcutModalOpen" @close="uiStore.closeAddShortcutModal()">
      <AddShortcutModal @close="uiStore.closeAddShortcutModal()" />
    </ModalDialog>

    <ModalDialog :is-open="uiStore.isSettingsModalOpen" @close="uiStore.closeSettingsModal()">
      <SettingsModalContent />
    </ModalDialog>

    <ContextMenu v-if="contextMenu.visible" :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y"
      :shortcut="contextMenu.shortcut" @close="closeContextMenu" @edit="handleEditShortcut"
      @delete="handleDeleteShortcut" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserGreeting from './components/UserGreeting.vue'
import SearchBox from './components/SearchBox.vue'
import ShortcutItem from './components/ShortcutItem.vue'
import AddShortcutButton from './components/AddShortcutButton.vue'
import ModalDialog from './components/ModalDialog.vue'
import AddShortcutModal from './views/AddShortcutModal.vue'
import SettingsModalContent from './views/SettingsModalContent.vue'
import ContextMenu from './components/ContextMenu.vue'

import { useUiStore } from './stores/ui'
import { useShortcutsStore, type Shortcut } from './stores/shortcuts'
import { useContextMenu } from './composables/useContextMenu'

const uiStore = useUiStore()
const shortcutsStore = useShortcutsStore()

if (shortcutsStore.shortcuts.length === 0) {
  shortcutsStore.addShortcut({ name: 'Google', url: 'https://google.com', customFavicon: '' })
  shortcutsStore.addShortcut({ name: 'Bilibili', url: 'https://bilibili.com', customFavicon: '' })
  shortcutsStore.addShortcut({ name: 'YouTube', url: 'https://www.youtube.com', customFavicon: '' })
  shortcutsStore.addShortcut({ name: 'Wikipedia', url: 'https://wikipedia.org', customFavicon: '' })
}

const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu<Shortcut>()

const draggedShortcutId = ref<string | null>(null)
const draggedShortcutIndex = ref<number | null>(null)
const dragOverShortcutId = ref<string | null>(null)

const handleDragStart = (shortcut: Shortcut, index: number, event: DragEvent) => {
  draggedShortcutId.value = shortcut.id
  draggedShortcutIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', shortcut.id) // Required for Firefox
  }
  // Add a slight delay to allow the browser to render the drag image
  setTimeout(() => {
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('dragging-source')
    }
  }, 0)
}

const handleDragOver = (targetShortcut: Shortcut, targetIndex: number, event: DragEvent) => {
  event.preventDefault() // Necessary to allow dropping
  if (draggedShortcutId.value && draggedShortcutId.value !== targetShortcut.id) {
    dragOverShortcutId.value = targetShortcut.id
  }
}

const handleDragLeave = () => {
  dragOverShortcutId.value = null
}

const handleDrop = (targetShortcut: Shortcut, targetIndex: number, event: DragEvent) => {
  event.preventDefault()
  const sourceId = draggedShortcutId.value
  const sourceIndex = draggedShortcutIndex.value

  if (sourceId && sourceIndex !== null && sourceId !== targetShortcut.id) {
    shortcutsStore.moveShortcut(sourceId, targetShortcut.id)
  }
  cleanupDragState()
}

const handleDragEnd = () => {
  document.querySelectorAll('.dragging-source').forEach(el => el.classList.remove('dragging-source'))
  cleanupDragState()
}

const cleanupDragState = () => {
  draggedShortcutId.value = null
  draggedShortcutIndex.value = null
  dragOverShortcutId.value = null
}

const handleEditShortcut = (shortcut: Shortcut) => {
  uiStore.openEditShortcutModal(shortcut)
  closeContextMenu()
}

const handleDeleteShortcut = (shortcut: Shortcut) => {
  if (confirm(`Are you sure you want to delete "${shortcut.name}"?`)) {
    shortcutsStore.deleteShortcut(shortcut.id)
  }
  closeContextMenu()
}
</script>

<style lang="scss" scoped>
@use './styles/variables' as *; // Keep SCSS variables for non-theme related things if any
@use 'sass:math';

.new-tab-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; // 新增：使内容垂直居中
  padding-bottom: 20px;
  width: 100%;
  background-color: var(--bg-color); // Reverted to CSS variable
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 8 * $shortcut-wrapper-width + 7 * $shortcut-gap + ($shortcut-icon-container-size - $shortcut-wrapper-width);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, $shortcut-wrapper-width);
  gap: $shortcut-gap;
  width: 8 * $shortcut-wrapper-width + 7 * $shortcut-gap;
  padding: 16px 0;
  margin-top: 7px;
  margin-left: math.div($shortcut-icon-container-size - $shortcut-wrapper-width, 2);
  margin-right: math.div($shortcut-icon-container-size - $shortcut-wrapper-width, 2);
  position: relative;
  /* For absolute positioning of dragging item if needed */
}

.draggable-item.dragging-source {
  opacity: 0.5;
  // transform: scale(0.95); /* Optional: slightly shrink the source item */
}

.draggable-item.drag-over {
  //background-color: rgba(255, 255, 255, 0.1);
  /* Visual feedback for drop target */
  outline: 2px dashed var(--accent-color); // Reverted to CSS variable
  outline-offset: -2px;
  // transform: scale(1.05);
}

.settings-button {
  position: fixed; // 新增：固定定位
  right: 20px; // 新增：距离右边20px
  bottom: 20px; // 新增：距离底部20px
  z-index: 2; // 新增：确保在最上层
  color: var(--text-secondary-color); // Reverted to CSS variable
  font-size: 23px;
  font-weight: 590;
}
</style>
