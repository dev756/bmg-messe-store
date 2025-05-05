<template>
  <div class="payment-qr">
    <h3>Pay with QR Code</h3>
    <div class="qr-container">
      <div v-if="qrCodeUrl" class="qr-code">
        <img :src="qrCodeUrl" alt="Payment QR Code" />
      </div>
      <div v-else class="qr-placeholder">
        <div class="loading-spinner"></div>
        <p>Generating QR code...</p>
      </div>
    </div>
    <div class="payment-details">
      <div class="amount">
        <span>Amount to pay:</span>
        <span class="price">CHF {{ amount.toFixed(2) }}</span>
      </div>
      <p class="instructions">
        Scan this QR-Code with your phone to proceed to payment
      </p>
      <a 
        v-if="showPaymentLink" 
        :href="paymentUrl" 
        target="_blank" 
        class="payment-link"
      >
        Pay Now
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  orderNumber: string;
  amount: number;
  paymentUrl: string;
}>();

const qrCodeUrl = ref<string | null>(null);
const showPaymentLink = ref(import.meta.env.VITE_SHOW_PAYMENT_LINK === 'true');

onMounted(async () => {
  try {
    // Generate QR code using the payment URL
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(props.paymentUrl)}`;
    qrCodeUrl.value = qrCode;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
});
</script>

<style scoped>
.payment-qr {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 2rem;
}

h3 {
  color: var(--text-color);
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: left;
}

.qr-container {
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-code img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.payment-details {
  text-align: center;
}

.amount {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.price {
  font-weight: 700;
  margin-left: 0.5rem;
}

.instructions {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

.payment-link {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--background-dark);
  text-decoration: none;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-link:hover {
  background-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style> 