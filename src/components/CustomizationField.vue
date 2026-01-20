<template>
  <div class="customization-field" :class="{ 'has-error': hasError }">
    <label v-if="field.inputType !== 'toggle'" :for="fieldId">
      {{ field.label }}
      <span v-if="field.validation?.required" class="required">*</span>
    </label>

    <!-- Text Input -->
    <input
      v-if="field.inputType === 'text'"
      type="text"
      :id="fieldId"
      :value="modelValue"
      :placeholder="field.placeholder"
      :maxlength="field.validation?.maxLength"
      @input="handleTextInput"
      @blur="validate"
    />

    <!-- Number Input -->
    <input
      v-else-if="field.inputType === 'number'"
      type="number"
      :id="fieldId"
      :value="modelValue"
      :placeholder="field.placeholder"
      :min="field.validation?.min"
      :max="field.validation?.max"
      @input="handleNumberInput"
      @blur="validate"
    />

    <!-- Select Input -->
    <select
      v-else-if="field.inputType === 'select'"
      :id="fieldId"
      :value="modelValue"
      @change="handleSelectChange"
    >
      <option value="" disabled>Bitte wählen...</option>
      <option
        v-for="option in field.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
        <template v-if="option.additionalPrice">
          (+EUR {{ option.additionalPrice.toFixed(2) }})
        </template>
      </option>
    </select>

    <!-- Toggle Input -->
    <div v-else-if="field.inputType === 'toggle'" class="toggle-wrapper">
      <label :for="fieldId" class="toggle-label">
        <input
          type="checkbox"
          :id="fieldId"
          :checked="modelValue === true"
          @change="handleToggleChange"
        />
        <span class="toggle-switch"></span>
        <span class="toggle-text">
          {{ field.label }}
          <span v-if="field.additionalPrice" class="toggle-price">
            (+EUR {{ field.additionalPrice.toFixed(2) }})
          </span>
        </span>
      </label>
    </div>

    <!-- Preset Select Input - Touch optimized cards -->
    <div v-else-if="field.inputType === 'preset-select'" class="preset-select">
      <!-- If no presets but custom allowed, show simpler UI -->
      <div v-if="(!field.presets || field.presets.length === 0) && field.allowCustomInput" class="custom-only-info">
        <span class="custom-only-price">EUR {{ (field.customInputPrice ?? 0).toFixed(2) }}</span>
      </div>
      <!-- Normal preset cards -->
      <div v-else class="preset-cards">
        <button
          v-for="preset in field.presets"
          :key="preset.id"
          type="button"
          class="preset-card"
          :class="{ 'is-selected': modelValue === preset.id }"
          @click="selectPreset(preset.id)"
        >
          <span class="preset-label">{{ preset.label }}</span>
          <span class="preset-price">EUR {{ preset.price.toFixed(2) }}</span>
        </button>
        <button
          v-if="field.allowCustomInput"
          type="button"
          class="preset-card custom-card"
          :class="{ 'is-selected': modelValue === 'custom' }"
          @click="selectPreset('custom')"
        >
          <span class="preset-label">Eigene Eingabe</span>
          <span class="preset-price">EUR {{ (field.customInputPrice ?? 0).toFixed(2) }}</span>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <span v-if="hasError" class="error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CustomizationField } from '../types';

const props = defineProps<{
  field: CustomizationField;
  modelValue: string | number | boolean;
  customizationId: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void;
  (e: 'presetSelected', presetId: string): void;
  (e: 'validationError', hasError: boolean): void;
}>();

const errorMessage = ref('');
const hasError = computed(() => !!errorMessage.value);

const fieldId = computed(() => `${props.customizationId}-${props.field.id}`);

function handleTextInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleNumberInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value === '' ? '' : Number(target.value);
  emit('update:modelValue', value);
}

function handleSelectChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
}

function handleToggleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
}

function handlePresetChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  emit('update:modelValue', value);
  emit('presetSelected', value);
}

function selectPreset(presetId: string) {
  emit('update:modelValue', presetId);
  emit('presetSelected', presetId);
}

function validate(): boolean {
  const validation = props.field.validation;
  if (!validation) {
    errorMessage.value = '';
    emit('validationError', false);
    return true;
  }

  const value = props.modelValue;

  // Required check
  if (validation.required) {
    if (value === '' || value === undefined || value === null) {
      errorMessage.value = 'Dieses Feld ist erforderlich';
      emit('validationError', true);
      return false;
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      errorMessage.value = `Mindestens ${validation.minLength} Zeichen erforderlich`;
      emit('validationError', true);
      return false;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      errorMessage.value = `Maximal ${validation.maxLength} Zeichen erlaubt`;
      emit('validationError', true);
      return false;
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errorMessage.value = validation.patternMessage ?? 'Ungültiges Format';
        emit('validationError', true);
        return false;
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      errorMessage.value = `Minimum ist ${validation.min}`;
      emit('validationError', true);
      return false;
    }

    if (validation.max !== undefined && value > validation.max) {
      errorMessage.value = `Maximum ist ${validation.max}`;
      emit('validationError', true);
      return false;
    }
  }

  errorMessage.value = '';
  emit('validationError', false);
  return true;
}

// Expose validate method for parent component
defineExpose({ validate });
</script>

<style scoped>
.customization-field {
  margin-bottom: 1rem;
}

.customization-field label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 0.9rem;
}

.required {
  color: #dc3545;
}

.customization-field input[type="text"],
.customization-field input[type="number"],
.customization-field select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.15s ease-in-out;
  background-color: white;
  font-family: 'Signika', 'Tahoma', sans-serif;
}

.customization-field input:focus,
.customization-field select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.customization-field.has-error input,
.customization-field.has-error select {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

/* Toggle styles */
.toggle-wrapper {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background-color: #ccc;
  border-radius: 13px;
  position: relative;
  transition: background-color 0.2s ease;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-label input:checked + .toggle-switch {
  background-color: var(--primary-color);
}

.toggle-label input:checked + .toggle-switch::after {
  transform: translateX(22px);
}

.toggle-text {
  font-weight: 500;
  color: var(--text-color);
}

.toggle-price {
  color: var(--text-secondary);
  font-weight: 400;
}

/* Preset select - Touch optimized cards */
.preset-select {
  width: 100%;
}

.preset-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  font-family: 'Signika', 'Tahoma', sans-serif;
  min-height: 70px;
  text-align: center;
}

.preset-card:hover {
  border-color: #000;
  background-color: white;
}

.preset-card:active {
  transform: scale(0.98);
}

.preset-card.is-selected {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

.preset-card.is-selected .preset-price {
  color: rgba(255, 255, 255, 0.9);
}

.preset-label {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.preset-price {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.preset-card.custom-card {
  border-style: dashed;
}

.preset-card.custom-card.is-selected {
  border-style: solid;
}

/* Custom only (no presets available) */
.custom-only-info {
  padding: 0.75rem 1rem;
  background-color: white;
  border: 2px solid #000;
  border-radius: 8px;
  text-align: center;
}

.custom-only-price {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
}
</style>
