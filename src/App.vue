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
          <img src="./assets/logo.svg" alt="FohlenShop Logo" class="logo-img" />
          <span class="logo-text">FohlenShop</span>
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
@import url('https://fonts.googleapis.com/css2?family=Signika:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #7ab929;
  --primary-dark: #6aa520;
  --background-dark: #ffffff;
  --background-light: #f4f4f4;
  --text-color: #000000;
  --text-secondary: #666666;
  --accent-color: #7ab929;
  --border-color: #eaeaea;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-dark);
  color: var(--text-color);
  font-family: 'Signika', 'Tahoma', sans-serif;
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
  background-color: #ffffff;
  min-width: 700px;
  box-shadow: var(--shadow-sm);
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-img {
  height: 60px;
  width: auto;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.cart-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  font-family: 'Signika', 'Tahoma', sans-serif;
  box-shadow: var(--shadow-sm);
}

.cart-link:hover {
  background-color: var(--primary-color);
  color: var(--background-dark);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
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
  font-family: 'Signika', 'Tahoma', sans-serif;
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
    height: 45px;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  .cart-link {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
