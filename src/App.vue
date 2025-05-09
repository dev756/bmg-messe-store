<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from './stores/cart';
import { storeToRefs } from 'pinia';
import PasswordScreen from './components/PasswordScreen.vue';
import { checkPassword } from './services/api';

const cartStore = useCartStore();
const { totalItems } = storeToRefs(cartStore);
const isAuthenticated = ref(false);

async function verifyStoredPassword() {
  const storedPassword = localStorage.getItem('store_password');
  if (!storedPassword) {
    isAuthenticated.value = false;
    return;
  }

  try {
    const isValid = await checkPassword(storedPassword);
    isAuthenticated.value = isValid;
    if (!isValid) {
      localStorage.removeItem('store_password');
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    isAuthenticated.value = false;
    localStorage.removeItem('store_password');
  }
}

function handleAuthenticated() {
  isAuthenticated.value = true;
}

onMounted(async () => {
  await verifyStoredPassword();
});
</script>

<template>
  <div class="app">
    <PasswordScreen
      v-if="!isAuthenticated"
      @authenticated="handleAuthenticated"
    />
    <template v-else>
      <nav class="navbar">
        <router-link to="/" class="logo">
          <img src="./assets/logo.svg" alt="Kapten & Son" class="logo-img" />
        </router-link>
        <div class="nav-links">
          <router-link to="/cart" class="cart-link">
            Warenkorb ({{ totalItems || 0 }})
          </router-link>
        </div>
      </nav>
      
      <main class="main-content">
        <router-view></router-view>
      </main>
    </template>
  </div>
</template>

<style>
:root {
  --primary-color: #000000;
  --background-dark: #ffffff;
  --background-light: rgb(237, 234, 230);
  --text-color: #000000;
  --text-secondary: #666666;
  --accent-color: #000000;
  --border-color: #e0e0e0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-dark);
  color: var(--text-color);
  font-family: 'UncutSans', sans-serif;
}

.navbar {
  background-color: var(--background-dark);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 700px;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.cart-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'UncutSans', sans-serif;
}

.cart-link:hover {
  background-color: var(--primary-color);
  color: var(--background-dark);
  border-color: var(--primary-color);
}

.main-content {
  flex: 1;
  padding: 2rem;
  width: 100%;
}

/* Reset some default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'UncutSans', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-dark);
}

/* Add custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-dark);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Add smooth transitions */
a, button {
  transition: all 0.3s ease;
}

/* Add text selection color */
::selection {
  background-color: var(--primary-color);
  color: var(--background-dark);
}

@media (max-width: 700px) {
  .navbar {
    padding: 1rem;
  }
  
  .logo-img {
    height: 30px;
  }
  
  .cart-link {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
