<template>
  <div class="customization-selector" :class="{ 'is-enabled': isEnabled, 'simple-addon': isSimpleAddon }">
    <div class="customization-header">
      <label class="enable-toggle">
        <input
          type="checkbox"
          v-model="isEnabled"
          @change="handleEnableChange"
        />
        <span class="checkbox-custom"></span>
        <span class="customization-name">
          {{ customization.name }}
          <span v-if="isSimpleAddon && customization.basePrice" class="inline-price">
            (+EUR {{ customization.basePrice.toFixed(2) }})
          </span>
        </span>
      </label>
      <span v-if="customization.description" class="customization-description">
        {{ customization.description }}
      </span>
    </div>

    <div v-if="isEnabled && hasVisibleFields" class="customization-fields">
      <template v-for="field in visibleFields" :key="field.id">
        <CustomizationField
          :field="field"
          :customization-id="customization.id"
          v-model="fieldValues[field.id]"
          @preset-selected="handlePresetSelected"
          @validation-error="(hasError) => handleFieldValidation(field.id, hasError)"
          :ref="(el) => setFieldRef(field.id, el)"
        />
      </template>

      <div v-if="currentPrice > 0" class="customization-price">
        +EUR {{ currentPrice.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import type { CustomizationType, SelectedCustomization, SelectedCustomizationField } from '../types';
import CustomizationField from './CustomizationField.vue';

const props = defineProps<{
  customization: CustomizationType;
}>();

const emit = defineEmits<{
  (e: 'update', value: SelectedCustomization | null): void;
  (e: 'validationChange', isValid: boolean): void;
}>();

const isEnabled = ref(false);
const fieldValues = reactive<Record<string, string | number | boolean>>({});
const fieldErrors = reactive<Record<string, boolean>>({});
const fieldRefs = reactive<Record<string, any>>({});
const isCustomMode = ref(false);

// Simple addon = has basePrice and no fields (or only non-visible fields)
const isSimpleAddon = computed(() => {
  return props.customization.basePrice !== undefined &&
         props.customization.fields.length === 0;
});

const hasVisibleFields = computed(() => {
  return visibleFields.value.length > 0;
});

// Check if this customization only has custom input (no presets)
const isCustomOnly = computed(() => {
  const presetField = props.customization.fields.find(f => f.inputType === 'preset-select');
  return presetField &&
         (!presetField.presets || presetField.presets.length === 0) &&
         presetField.allowCustomInput;
});

// Initialize field values with defaults
function initializeFieldValues() {
  props.customization.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      fieldValues[field.id] = field.defaultValue;
    } else if (field.inputType === 'toggle') {
      fieldValues[field.id] = false;
    } else if (field.inputType === 'preset-select') {
      // If no presets available, auto-select custom
      if (!field.presets || field.presets.length === 0) {
        fieldValues[field.id] = 'custom';
        isCustomMode.value = true;
      } else {
        fieldValues[field.id] = '';
      }
    } else {
      fieldValues[field.id] = '';
    }
    fieldErrors[field.id] = false;
  });
}

initializeFieldValues();

// Compute visible fields based on dependsOn conditions
const visibleFields = computed(() => {
  return props.customization.fields.filter(field => {
    if (!field.dependsOn) return true;

    const dependentValue = fieldValues[field.dependsOn.fieldId];

    // Handle customOnly condition for preset-select
    if (field.dependsOn.customOnly) {
      return isCustomMode.value;
    }

    // Handle specific values condition
    if (field.dependsOn.values) {
      return field.dependsOn.values.includes(dependentValue as string | boolean | number);
    }

    return true;
  });
});

// Calculate current price based on field values
const currentPrice = computed(() => {
  let price = props.customization.basePrice ?? 0;

  props.customization.fields.forEach(field => {
    const value = fieldValues[field.id];

    if (field.inputType === 'preset-select') {
      if (value === 'custom') {
        // Custom input price
        price += field.customInputPrice ?? 0;
      } else if (value && field.presets) {
        // Find preset and use its price
        const preset = field.presets.find(p => p.id === value);
        if (preset) {
          price += preset.price;
        }
      }
    } else if (field.inputType === 'toggle' && value === true) {
      price += field.additionalPrice ?? 0;
    } else if (field.inputType === 'select' && value && field.options) {
      const option = field.options.find(o => o.value === value);
      if (option?.additionalPrice) {
        price += option.additionalPrice;
      }
    }
  });

  return price;
});

// Check if all required fields are valid
const isValid = computed(() => {
  if (!isEnabled.value) return true;

  return visibleFields.value.every(field => {
    if (!field.validation?.required) return true;

    const value = fieldValues[field.id];
    if (value === '' || value === undefined || value === null) return false;
    if (fieldErrors[field.id]) return false;

    return true;
  });
});

function setFieldRef(fieldId: string, el: any) {
  if (el) {
    fieldRefs[fieldId] = el;
  }
}

function handleEnableChange() {
  if (!isEnabled.value) {
    // Reset to defaults when disabled
    initializeFieldValues();
    if (!isCustomOnly.value) {
      isCustomMode.value = false;
    }
  } else if (isCustomOnly.value) {
    // Auto-enable custom mode for custom-only customizations
    isCustomMode.value = true;
    const presetField = props.customization.fields.find(f => f.inputType === 'preset-select');
    if (presetField) {
      fieldValues[presetField.id] = 'custom';
    }
  }
  emitUpdate();
  emit('validationChange', isValid.value);
}

function handlePresetSelected(presetId: string) {
  if (presetId === 'custom') {
    isCustomMode.value = true;
    // Clear target fields for manual entry
    const presetField = props.customization.fields.find(f => f.inputType === 'preset-select');
    if (presetField?.targetFields) {
      presetField.targetFields.forEach(targetId => {
        fieldValues[targetId] = '';
      });
    }
  } else {
    isCustomMode.value = false;
    // Auto-fill target fields from preset values
    const presetField = props.customization.fields.find(f => f.inputType === 'preset-select');
    if (presetField?.presets) {
      const preset = presetField.presets.find(p => p.id === presetId);
      if (preset && presetField.targetFields) {
        presetField.targetFields.forEach(targetId => {
          if (preset.values[targetId] !== undefined) {
            fieldValues[targetId] = preset.values[targetId];
          }
        });
      }
    }
  }
  emitUpdate();
}

function handleFieldValidation(fieldId: string, hasError: boolean) {
  fieldErrors[fieldId] = hasError;
  emit('validationChange', isValid.value);
}

function emitUpdate() {
  if (!isEnabled.value) {
    emit('update', null);
    return;
  }

  const selectedFields: SelectedCustomizationField[] = [];

  props.customization.fields.forEach(field => {
    const value = fieldValues[field.id];
    if (value === '' || value === undefined || value === null) return;

    // Skip hidden fields
    if (field.dependsOn) {
      if (field.dependsOn.customOnly && !isCustomMode.value) return;
      if (field.dependsOn.values && !field.dependsOn.values.includes(fieldValues[field.dependsOn.fieldId] as any)) return;
    }

    let displayValue = String(value);
    let additionalPrice = 0;

    if (field.inputType === 'preset-select') {
      if (value === 'custom') {
        displayValue = 'Eigene Eingabe';
        additionalPrice = field.customInputPrice ?? 0;
      } else if (field.presets) {
        const preset = field.presets.find(p => p.id === value);
        if (preset) {
          displayValue = preset.label;
          additionalPrice = preset.price;
        }
      }
    } else if (field.inputType === 'toggle') {
      displayValue = value ? 'Ja' : 'Nein';
      if (value) {
        additionalPrice = field.additionalPrice ?? 0;
      }
    } else if (field.inputType === 'select' && field.options) {
      const option = field.options.find(o => o.value === value);
      if (option) {
        displayValue = option.label;
        additionalPrice = option.additionalPrice ?? 0;
      }
    }

    selectedFields.push({
      fieldId: field.id,
      value,
      displayValue,
      additionalPrice
    });
  });

  emit('update', {
    customizationId: props.customization.id,
    customizationName: props.customization.name,
    fields: selectedFields,
    totalPrice: currentPrice.value
  });
}

// Watch for field value changes
watch(fieldValues, () => {
  emitUpdate();
}, { deep: true });

// Watch for isValid changes
watch(isValid, (newIsValid) => {
  emit('validationChange', newIsValid);
});

// Validate all fields (exposed for parent component)
function validateAll(): boolean {
  let allValid = true;

  visibleFields.value.forEach(field => {
    const fieldRef = fieldRefs[field.id];
    if (fieldRef?.validate) {
      const isFieldValid = fieldRef.validate();
      if (!isFieldValid) allValid = false;
    }
  });

  return allValid;
}

defineExpose({ validateAll, isEnabled, isValid });
</script>

<style scoped>
.customization-selector {
  background-color: white;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.customization-selector.is-enabled {
  border-color: var(--primary-color);
  background-color: white;
}

.customization-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.enable-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.enable-toggle input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  background-color: white;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.enable-toggle input:checked + .checkbox-custom {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.enable-toggle input:checked + .checkbox-custom::after {
  display: block;
}

.customization-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-color);
}

.inline-price {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 1rem;
}

.customization-selector.simple-addon.is-enabled .inline-price {
  color: var(--primary-color);
  font-weight: 600;
}

.customization-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-left: 2.25rem;
}

.customization-fields {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 2px solid #000;
}

.customization-price {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #000;
  text-align: right;
}
</style>
