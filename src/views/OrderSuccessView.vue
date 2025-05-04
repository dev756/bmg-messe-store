<template>
  <div class="order-success">
    <div class="success-content">
      <div class="success-icon">✓</div>
      <h1>Order Confirmed!</h1>
      <p class="message">Thank you for your order. We'll notify you when it's ready for pickup.</p>
      <div class="order-details">
        <p>Order Number: {{ orderNumber }}</p>
        <p>Total Amount: CHF {{ totalAmount.toFixed(2) }}</p>
      </div>

      <PaymentQRCode 
        :order-number="orderNumber"
        :amount="totalAmount"
        class="payment-section"
      />

      <router-link to="/" class="continue-shopping">
        Continue Shopping
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PaymentQRCode from '../components/PaymentQRCode.vue';

const route = useRoute();
const orderNumber = ref(typeof route.params.orderNumber === 'string' ? route.params.orderNumber : '');
const totalAmount = ref(0);

onMounted(async () => {
  try {
    // TODO: Replace with actual API call to get order details
    // This is a placeholder that sets a dummy amount
    totalAmount.value = 99.99;
  } catch (error) {
    console.error('Failed to fetch order details:', error);
  }
});
</script>

<style scoped>
.order-success {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-content {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 3rem;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: var(--primary-color);
  color: var(--background-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 2rem;
}

h1 {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.message {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.order-details {
  background-color: var(--background-dark);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.order-details p {
  color: var(--text-color);
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.payment-section {
  margin-bottom: 2rem;
}

.continue-shopping {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--background-dark);
  padding: 1rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .order-success {
    padding: 1rem;
  }

  .success-content {
    padding: 2rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
}
</style> 