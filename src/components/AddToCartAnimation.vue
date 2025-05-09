<template>
  <div v-if="isAnimating" class="animation-container">
    <div class="product-jump" :style="animationStyle">
      <img :src="imageUrl" :alt="productName" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  imageUrl: string;
  productName: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}>();

const isAnimating = ref(true);
const animationStyle = ref({
  left: `${props.startPosition.x}px`,
  top: `${props.startPosition.y}px`,
  transform: 'scale(1)',
});

onMounted(() => {
  // Start the animation
  requestAnimationFrame(() => {
    animationStyle.value = {
      left: `${props.endPosition.x}px`,
      top: `${props.endPosition.y}px`,
      transform: 'scale(0.5)',
    };
  });

  // Remove the element after animation
  setTimeout(() => {
    isAnimating.value = false;
  }, 800);
});
</script>

<style scoped>
.animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.product-jump {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  will-change: transform, left, top;
}

.product-jump img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 