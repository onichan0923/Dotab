<template>
  <div class="add-shortcut-modal">
    <h2>{{ isEditing ? 'Edit website' : 'Add a website' }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="shortcut-name">Name</label>
        <input type="text" id="shortcut-name" class="input-field" v-model="formData.name" required />
      </div>

      <div class="form-group">
        <label for="shortcut-url">URL</label>
        <input type="url" id="shortcut-url" class="input-field" v-model="formData.url" placeholder="https://github.com"
          required />
      </div>

      <div class="form-group">
        <label>Favicon (URL or local file)</label>
        <div class="favicon-options">
          <input type="text" class="input-field" v-model="formData.customFavicon"
            placeholder="(Fetch automatically) or enter image URL" />
          <span class="or-divider">or</span>
          <label for="favicon-upload" class="btn btn--secondary upload-button">
            <span class="font-icon"></span> Upload From PC
            <input type="file" id="favicon-upload" @change="handleFaviconUpload" accept="image/*"
              class="visually-hidden-input" />
          </label>
        </div>
        <p v-if="faviconFileName" class="favicon-file-name">Selected: {{ faviconFileName }}</p>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn--secondary" @click="$emit('close')">Cancel</button>
        <button type="submit" class="btn btn--primary">{{ isEditing ? 'Save' : '+ Add' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useShortcutsStore, type Shortcut } from '../stores/shortcuts'
import { useUiStore } from '../stores/ui'

const emit = defineEmits(['close'])

const shortcutsStore = useShortcutsStore()
const uiStore = useUiStore()

const isEditing = computed(() => !!uiStore.editingShortcut)

// ✨ [修复] 确保 faviconFile 类型为 File | undefined, 初始值为 undefined
const initialFormData = (): Omit<Shortcut, 'id'> & { faviconFile?: File | undefined } => ({
  name: '',
  url: '',
  customFavicon: '',
  faviconFile: undefined, // 从 null 改为 undefined
})

const formData = reactive(initialFormData())
const faviconFileName = ref('')

watch(
  () => uiStore.editingShortcut,
  (shortcutToEdit) => {
    if (shortcutToEdit) {
      formData.name = shortcutToEdit.name
      formData.url = shortcutToEdit.url
      formData.customFavicon = shortcutToEdit.customFavicon || ''
      formData.faviconFile = undefined // ✨ [修复] 从 null 改为 undefined
      faviconFileName.value = ''
    } else {
      Object.assign(formData, initialFormData()) // formData 会被重置为包含 faviconFile: undefined
      faviconFileName.value = ''
    }
  },
  { immediate: true },
)

const handleFaviconUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    formData.faviconFile = file
    faviconFileName.value = file.name
    formData.customFavicon = ''
  }
}

const handleSubmit = async () => {
  let finalFaviconUrl = formData.customFavicon

  if (formData.faviconFile) {
    finalFaviconUrl = await new Promise<string>((resolve, reject) => {
      // Added reject for safety
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('File reading failed')) // Added error handling
      reader.readAsDataURL(formData.faviconFile!)
    })
  }

  const shortcutData = {
    name: formData.name,
    url: formData.url,
    customFavicon: finalFaviconUrl,
  }

  if (isEditing.value && uiStore.editingShortcut) {
    shortcutsStore.updateShortcut({ ...uiStore.editingShortcut, ...shortcutData })
  } else {
    shortcutsStore.addShortcut(shortcutData)
  }
  emit('close')
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.add-shortcut-modal {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary-color);
    margin-top: 0;
    margin-bottom: 24px;
  }

  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary-color);
      margin-bottom: 8px;
    }
  }

  .favicon-options {
    display: flex;
    align-items: center;
    gap: 12px;

    .input-field {
      flex-grow: 1;
    }

    .or-divider {
      font-size: 13px;
      color: var(--text-secondary-color);
    }

    .upload-button {
      white-space: nowrap;
      // For SF Symbol "square.and.arrow.up" (􀈽), ensure $font-sf-symbols is correctly applied
      // or embed the symbol directly if your editor/font supports it well.
    }
  }

  .favicon-file-name {
    font-size: 12px;
    color: var(--text-secondary-color);
    margin-top: 8px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
  }
}
</style>
