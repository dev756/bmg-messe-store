<template>
  <div 
    v-if="show" 
    class="toast" 
    @click="close"
    :class="{ 
      'toast--success': type === 'success',
      'toast--error': type === 'error'
    }"
  >
    <div class="toast-content">
      <span class="toast-message">{{ message }}</span>
      <button class="toast-close" @click.stop="close">×</button>
    </div>
    <div class="toast-progress" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  message: string;
  type?: 'success' | 'error';
  duration?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const show = ref(true);
const progress = ref(0);
let progressInterval: number;
let timeout: number;

function close() {
  show.value = false;
  emit('close');
}

onMounted(() => {
  const duration = props.duration || 3000;
  const step = 100 / (duration / 10);
  
  progressInterval = window.setInterval(() => {
    progress.value = Math.min(100, progress.value + step);
  }, 10);

  timeout = window.setTimeout(() => {
    close();
  }, duration);
});

onUnmounted(() => {
  clearInterval(progressInterval);
  clearTimeout(timeout);
});
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #f0f7f0;
  border: 1px solid #4CAF50;
  border-radius: 8px;
  padding: 1rem;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
  z-index: 1000;
  cursor: pointer;
  overflow: hidden;
}

.toast--success {
  border-left: 4px solid #4CAF50;
}

.toast--error {
  background-color: #fff5f5;
  border: 1px solid #e57373;
  border-left: 4px solid #e57373;
  box-shadow: 0 4px 12px rgba(229, 115, 115, 0.1);
}

.toast--error .toast-message {
  color: #c62828;
}

.toast--error .toast-close {
  color: #e57373;
}

.toast--error .toast-close:hover {
  color: #c62828;
}

.toast--error .toast-progress {
  background-color: #e57373;
}

.toast-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.toast-message {
  color: #2E7D32;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: #4CAF50;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
}

.toast-close:hover {
  color: #2E7D32;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: #4CAF50;
  transition: width 0.1s linear;
}
</style> 