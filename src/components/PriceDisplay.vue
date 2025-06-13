<template>
  <div class="price-display" :class="{ 'large': size === 'large' }">
    <span v-if="hasSpecialPrice" class="special-price">
      EUR {{ specialPrice!.toFixed(2) }}
    </span>
    <span v-else class="regular-price">
      EUR {{ price.toFixed(2) }}
    </span>
    <span v-if="hasSpecialPrice" class="original-price">
      EUR {{ price.toFixed(2) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  price: number;
  specialPrice?: number;
  size?: 'normal' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'normal'
});

const hasSpecialPrice = computed(() => props.specialPrice !== undefined && props.specialPrice !== null);
</script>

<style scoped>
.price-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-display.large {
  gap: 0.5rem;
}

.special-price {
  font-size: inherit;
  font-weight: bold;
  color: var(--primary-color);
}

.price-display.large .special-price {
  font-size: 2rem;
}

.regular-price {
  font-size: inherit;
  font-weight: bold;
  color: var(--primary-color);
}

.price-display.large .regular-price {
  font-size: 2rem;
}

.original-price {
  font-size: 0.85em;
  color: var(--text-secondary);
  text-decoration: line-through;
  font-weight: normal;
}

.price-display.large .original-price {
  font-size: 1.2rem;
}
</style> 