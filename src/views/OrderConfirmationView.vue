<template>
  <div class="order-confirmation">
    <div class="confirmation-card">
      <div class="success-icon">✓</div>
      <h1>Order Confirmed!</h1>
      
      <div class="order-details">
        <h2>Order Details</h2>
        <p class="order-number">Order Number: {{ orderNumber }}</p>
        
        <div class="payment-info">
          <h3>Payment Information</h3>
          <p v-if="paymentMethod === 'pickup'">
            You have chosen to pay on pickup. Please bring your order number when collecting your order.
          </p>
          <p v-else>
            Thank you for your payment. Your order is being processed.
          </p>
        </div>
      </div>
      
      <router-link to="/" class="continue-shopping">
        Return to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const orderNumber = computed(() => route.query.orderNumber as string);
const paymentMethod = computed(() => route.query.paymentMethod as 'immediate' | 'pickup');
</script>

<style scoped>
.order-confirmation {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.confirmation-card {
  background-color: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.success-icon {
  background-color: #4CAF50;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
}

.order-details {
  margin: 2rem 0;
  text-align: left;
}

.order-number {
  font-size: 1.2rem;
  color: #666;
  margin: 1rem 0;
}

.payment-info {
  background-color: #f8f8f8;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.continue-shopping {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #ffc72c;
  color: #27251f;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.continue-shopping:hover {
  background-color: #ffd54f;
}
</style> 