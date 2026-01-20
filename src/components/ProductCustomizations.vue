<template>
  <div v-if="effectiveCustomizations.length > 0" class="product-customizations">
    <h3 class="customizations-title">Personalisierung</h3>

    <CustomizationSelector
      v-for="customization in effectiveCustomizations"
      :key="`${customization.id}-${variantKey}`"
      :customization="customization"
      @update="(value) => handleCustomizationUpdate(customization.id, value)"
      @validation-change="(isValid) => handleValidationChange(customization.id, isValid)"
      :ref="(el) => setCustomizationRef(customization.id, el)"
    />

    <div v-if="totalPrice > 0" class="customizations-total">
      <span>Personalisierung gesamt:</span>
      <span class="total-price">+EUR {{ totalPrice.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import type { Product, CustomizationType, SelectedCustomization } from '../types';
import { useProductStore } from '../stores/products';
import CustomizationSelector from './CustomizationSelector.vue';

const props = defineProps<{
  product: Product;
  selectedVariants?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:customizations', value: SelectedCustomization[]): void;
  (e: 'validationChange', isValid: boolean): void;
}>();

const productStore = useProductStore();
const selectedCustomizations = reactive<Record<string, SelectedCustomization | null>>({});
const validationStates = reactive<Record<string, boolean>>({});
const customizationRefs = reactive<Record<string, any>>({});

// Get effective customizations for current product and variant selection
const effectiveCustomizations = computed(() => {
  return productStore.getEffectiveCustomizations(props.product, props.selectedVariants);
});

// Key for forcing re-render when variants change
const variantKey = computed(() => {
  return props.selectedVariants ? JSON.stringify(props.selectedVariants) : 'none';
});

// Calculate total customization price
const totalPrice = computed(() => {
  let total = 0;
  Object.values(selectedCustomizations).forEach(customization => {
    if (customization) {
      total += customization.totalPrice;
    }
  });
  return total;
});

// Check if all enabled customizations are valid
const isAllValid = computed(() => {
  return Object.values(validationStates).every(isValid => isValid);
});

function setCustomizationRef(customizationId: string, el: any) {
  if (el) {
    customizationRefs[customizationId] = el;
  }
}

function handleCustomizationUpdate(customizationId: string, value: SelectedCustomization | null) {
  selectedCustomizations[customizationId] = value;
  emitSelectedCustomizations();
}

function handleValidationChange(customizationId: string, isValid: boolean) {
  validationStates[customizationId] = isValid;
  emit('validationChange', isAllValid.value);
}

function emitSelectedCustomizations() {
  const selected = Object.values(selectedCustomizations).filter(
    (c): c is SelectedCustomization => c !== null
  );
  emit('update:customizations', selected);
}

// Track previous variants to detect changes
const previousVariants = ref<string>('');

// Reset all customizations when variants change
watch(() => props.selectedVariants, (newVariants) => {
  const variantKey = newVariants ? JSON.stringify(newVariants) : '';

  // Only reset if variants actually changed (not on initial load)
  if (previousVariants.value && previousVariants.value !== variantKey) {
    // Clear all customization state
    Object.keys(selectedCustomizations).forEach(id => {
      delete selectedCustomizations[id];
    });
    Object.keys(validationStates).forEach(id => {
      delete validationStates[id];
    });
    Object.keys(customizationRefs).forEach(id => {
      delete customizationRefs[id];
    });

    emitSelectedCustomizations();
    emit('validationChange', true);
  }

  previousVariants.value = variantKey;
}, { deep: true });

// Initialize validation states for available customizations
watch(effectiveCustomizations, (newCustomizations) => {
  // Clear customizations that are no longer available
  const availableIds = new Set(newCustomizations.map(c => c.id));

  Object.keys(selectedCustomizations).forEach(id => {
    if (!availableIds.has(id)) {
      delete selectedCustomizations[id];
      delete validationStates[id];
    }
  });

  // Initialize validation states for new customizations
  newCustomizations.forEach(c => {
    if (!(c.id in validationStates)) {
      validationStates[c.id] = true; // Default to valid (not enabled)
    }
  });

  emitSelectedCustomizations();
}, { immediate: true });

// Validate all customizations
function validateAll(): boolean {
  let allValid = true;

  effectiveCustomizations.value.forEach(customization => {
    const ref = customizationRefs[customization.id];
    if (ref?.isEnabled && ref?.validateAll) {
      const isValid = ref.validateAll();
      if (!isValid) allValid = false;
    }
  });

  return allValid;
}

// Get current selected customizations
function getSelectedCustomizations(): SelectedCustomization[] {
  return Object.values(selectedCustomizations).filter(
    (c): c is SelectedCustomization => c !== null
  );
}

defineExpose({
  validateAll,
  getSelectedCustomizations,
  totalPrice,
  isAllValid
});
</script>

<style scoped>
.product-customizations {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  border: 2px solid #000;
}

.customizations-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 1.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.customizations-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 6px;
  border: 2px solid #000;
  margin-top: 1rem;
}

.customizations-total span {
  font-weight: 600;
  color: var(--text-color);
}

.total-price {
  font-size: 1.2rem;
  color: var(--primary-color);
}
</style>
