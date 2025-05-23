<template>
  <div class="coin-counter">
    <!-- Coin Image -->
    <img :src="coinImage" alt="Coin" class="coin-image" />

    <!-- Counter -->
    <div class="counter">
      <button @click="decrement" class="counter-button">-</button>
      <span class="counter-value">{{ count }}</span>
      <button @click="increment" class="counter-button">+</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      coinImage: 'https://banner2.cleanpng.com/20231219/qqa/transparent-dollar-sign-golden-coin-with-dollar-sign-on-cloudy-1710967634306.webp', // Replace with your coin image URL
    };
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      if (this.count > 0) this.count--;
    },
  },
};
</script>

<style scoped>
.coin-counter {
  display: flex;
  align-items: center;
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
  font-size: 20px;
}
</style>