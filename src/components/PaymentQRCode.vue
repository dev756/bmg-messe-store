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
        Scan this QR code with your banking app to pay for your order.
        The payment will be processed immediately.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  orderNumber: string;
  amount: number;
}>();

const qrCodeUrl = ref<string | null>(null);

onMounted(async () => {
  try {
    // TODO: Replace with actual API call to generate QR code
    // This is a placeholder that generates a dummy QR code
    const dummyQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=order:${props.orderNumber},amount:${props.amount}`;
    qrCodeUrl.value = dummyQRCode;
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
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

.payment-details {
  text-align: left;
}

.amount {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.price {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.3rem;
}

.instructions {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 