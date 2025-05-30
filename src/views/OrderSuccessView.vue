<template>
  <div class="order-success">
    <div class="success-content">
      <div v-if="!isOrderPaid" class="payment-pending">
        <div class="success-icon">✓</div>
        <h1>Bestellung Bestätigt!</h1>
        <p class="message">Vielen Dank für Ihre Bestellung. Wir benachrichtigen Sie, wenn sie zur Abholung bereit ist.</p>
        <div class="order-details">
          <p>Bestellnummer: {{ orderNumber }}</p>
          <p>Gesamtbetrag: EUR {{ totalAmount.toFixed(2) }}</p>
        </div>

        <PaymentQRCode 
          :order-number="orderNumber"
          :amount="totalAmount"
          :payment-url="paymentUrl"
          class="payment-section"
        />

        <router-link 
          to="/" 
          class="continue-shopping"
          @click="clearOrderData"
        >
          Weiter Einkaufen
        </router-link>
      </div>

      <div v-else class="payment-success">
        <div class="success-icon paid">✓</div>
        <h1>Die Bestellung wurde bezahlt</h1>
        <p class="message">Ihre Zahlung wurde erfolgreich verarbeitet. Sie können Ihre Bestellung an der Kasse abholen.</p>
        <div class="order-details">
          <p>Bestellnummer: {{ orderNumber }}</p>
          <p>Gesamtbetrag: EUR {{ totalAmount.toFixed(2) }}</p>
        </div>

        <router-link 
          to="/" 
          class="continue-shopping"
          @click="clearOrderData"
        >
          Weiter Einkaufen
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PaymentQRCode from '../components/PaymentQRCode.vue';
import { checkOrderPaymentStatus } from '../services/api';

const route = useRoute();
const router = useRouter();
const orderNumber = ref(typeof route.params.orderNumber === 'string' ? route.params.orderNumber : '');
const totalAmount = ref(parseFloat(route.query.totalAmount as string) || 0);
const paymentUrl = ref(typeof route.query.paymentUrl === 'string' ? route.query.paymentUrl : '');
const isOrderPaid = ref(false);
const pollingInterval = ref<number | null>(null);

const clearOrderData = () => {
  // Clear the current route data
  orderNumber.value = '';
  totalAmount.value = 0;
  paymentUrl.value = '';
  
  // Stop polling when leaving the page
  stopPolling();
  
  // Replace the current history entry with a clean one
  router.replace({ name: 'home' });
};

const checkPaymentStatus = async () => {
  try {
    const isPaid = await checkOrderPaymentStatus(orderNumber.value);
    if (isPaid) {
      isOrderPaid.value = true;
      stopPolling();
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    // Continue polling even if there's an error
  }
};

const startPolling = () => {
  // Check immediately
  checkPaymentStatus();
  
  // Then check every 1 second
  pollingInterval.value = window.setInterval(checkPaymentStatus, 1000);
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

onMounted(async () => {
  // Start polling for payment status
  startPolling();
});

onUnmounted(() => {
  // Clean up polling when component is unmounted
  stopPolling();
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

.success-icon.paid {
  background-color: #4caf50;
  animation: pulse 2s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
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