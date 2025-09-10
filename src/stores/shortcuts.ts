import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid' // 用uuid生成唯一ID

export interface Shortcut {
  id: string
  name: string
  url: string
  customFavicon?: string // 在线URL或本地上传的DataURL
  faviconFile?: File // 暂存本地上传的文件
}

interface ShortcutsState {
  shortcuts: Shortcut[]
}

// 尝试从localStorage加载数据
const loadShortcutsFromLocalStorage = (): Shortcut[] => {
  const storedShortcuts = localStorage.getItem('dotab-shortcuts')
  try {
    return storedShortcuts ? JSON.parse(storedShortcuts) : []
  } catch (e) {
    console.error('Failed to parse shortcuts from localStorage', e)
    return []
  }
}

// 保存数据到localStorage
const saveShortcutsToLocalStorage = (shortcuts: Shortcut[]) => {
  localStorage.setItem('dotab-shortcuts', JSON.stringify(shortcuts))
}

export const useShortcutsStore = defineStore('shortcuts', {
  state: (): ShortcutsState => ({
    shortcuts: loadShortcutsFromLocalStorage(),
  }),
  actions: {
    addShortcut(shortcutData: Omit<Shortcut, 'id' | 'faviconFile'> & { faviconFile?: File }) {
      const newShortcut: Shortcut = {
        ...shortcutData,
        id: uuidv4(),
      }
      this.shortcuts.push(newShortcut)
      saveShortcutsToLocalStorage(this.shortcuts)
    },
    updateShortcut(updatedShortcut: Shortcut) {
      const index = this.shortcuts.findIndex((s) => s.id === updatedShortcut.id)
      if (index !== -1) {
        this.shortcuts[index] = { ...updatedShortcut }
        saveShortcutsToLocalStorage(this.shortcuts)
      }
    },
    deleteShortcut(id: string) {
      this.shortcuts = this.shortcuts.filter((s) => s.id !== id)
      saveShortcutsToLocalStorage(this.shortcuts)
    },
    moveShortcut(sourceId: string, targetId: string) {
      const shortcuts = this.shortcuts
      const sourceIndex = shortcuts.findIndex((s) => s.id === sourceId)
      const targetIndex = shortcuts.findIndex((s) => s.id === targetId)

      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        // 如果源或目标无效，或者它们是同一个项目，则不执行任何操作
        return
      }

      // 从数组中移除被拖动的快捷方式
      const [movedShortcut] = shortcuts.splice(sourceIndex, 1)
      // 将被拖动的快捷方式插入到目标快捷方式的位置
      shortcuts.splice(targetIndex, 0, movedShortcut)
      saveShortcutsToLocalStorage(this.shortcuts)
    },
  },
})
