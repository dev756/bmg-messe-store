<script setup lang="ts">
import { useCartStore } from './stores/cart';
import { storeToRefs } from 'pinia';

const cartStore = useCartStore();
const { totalItems } = storeToRefs(cartStore);
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <router-link to="/" class="logo">McShop</router-link>
      <div class="nav-links">
        <router-link to="/cart" class="cart-link">
          Cart ({{ totalItems || 0 }})
        </router-link>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #ffc72c;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27251f;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.cart-link {
  color: #27251f;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #fff;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Reset some default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}
</style>
