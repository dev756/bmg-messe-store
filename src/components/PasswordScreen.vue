<template>
  <div class="password-screen">
    <div class="password-container">
      <h1>Enter Password</h1>
      <form @submit.prevent="checkPassword" class="password-form">
        <div class="form-group">
          <input
            type="password"
            v-model="password"
            placeholder="Enter password"
            :class="{ 'error': error }"
            autofocus
          />
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Checking...' : 'Enter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { checkPassword as checkPasswordApi } from '../services/api';

const password = ref('');
const error = ref('');
const isLoading = ref(false);

const emit = defineEmits<{
  (e: 'authenticated'): void
}>();

async function checkPassword() {
  if (!password.value) {
    error.value = 'Please enter a password';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    const isValid = await checkPasswordApi(password.value);
    if (isValid) {
      localStorage.setItem('store_password', password.value);
      emit('authenticated');
    } else {
      error.value = 'Invalid password';
    }
  } catch (err) {
    error.value = 'Error checking password';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.password-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-dark);
}

.password-container {
  background-color: var(--background-light);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--background-dark);
  color: var(--text-color);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
}

button {
  background-color: var(--primary-color);
  color: var(--background-dark);
  border: none;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: var(--text-secondary);
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 