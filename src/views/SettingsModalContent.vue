<template>
  <div class="settings-content">
    <h2>Settings</h2>
    <p>这里的设置页面还在施工中哦... 🚧</p>
    <div class="modal-actions">
      <button type="button" class="btn btn--primary" @click="uiStore.closeSettingsModal()">
        OK
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/ui'
const uiStore = useUiStore()
</script>

<style lang="scss" scoped>
.settings-content {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary-color);
    margin-top: 0;
    margin-bottom: 24px;
    text-align: center;
  }

  p {
    color: var(--text-secondary-color);
    line-height: 1.6;
    text-align: center;
    margin-bottom: 16px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
  }
}
</style>
