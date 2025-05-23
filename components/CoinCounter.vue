<script setup lang="ts">

defineProps<{
	count?: number
}>();

const coinImage = 'https://banner2.cleanpng.com/20231219/qqa/transparent-dollar-sign-golden-coin-with-dollar-sign-on-cloudy-1710967634306.webp';

</script>
<template>
  <div class="coin-counter">
    <!-- Coin Image -->
    <img :src="coinImage" alt="Coin" class="coin-image" />

    <!-- Counter -->
    <div class="counter">
      <span v-if="count !== undefined" class="counter-value">{{ count }}</span>
    </div>
  </div>
</template>


<style scoped>
.coin-counter {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 25%;
  padding: 0 10px;
}

.coin-image {
  width: 50px; /* Adjust size as necessary */
  height: 50px;
  border-radius: 50%;
}

.counter {
  display: flex;
  align-items: center;
}

.counter-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  font-size: 18px;
  cursor: pointer;
  margin: 0 5px;
}

.counter-button:hover {
  background-color: #45a049;
}

.counter-value {
  font-size: 30px;
  color: rgb(0, 0, 0);
}
</style>