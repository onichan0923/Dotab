import { defineStore } from 'pinia'
import type { Shortcut } from './shortcuts'

interface UiState {
  isAddShortcutModalOpen: boolean
  isSettingsModalOpen: boolean
  editingShortcut: Shortcut | null // 用于编辑模式
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    isAddShortcutModalOpen: false,
    isSettingsModalOpen: false,
    editingShortcut: null,
  }),
  actions: {
    openAddShortcutModal() {
      this.isAddShortcutModalOpen = true
      this.editingShortcut = null // 确保不是编辑模式
    },
    closeAddShortcutModal() {
      this.isAddShortcutModalOpen = false
      this.editingShortcut = null
    },
    openEditShortcutModal(shortcut: Shortcut) {
      this.editingShortcut = shortcut
      this.isAddShortcutModalOpen = true // 复用同一个模态框
    },
    openSettingsModal() {
      this.isSettingsModalOpen = true
    },
    closeSettingsModal() {
      this.isSettingsModalOpen = false
    },
  },
})
