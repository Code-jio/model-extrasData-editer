<template>
  <div class="status">{{ status }}</div>
</template>

<script setup lang="ts">
defineProps<{
  status: string
}>()
</script>

<style scoped>
.status {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
}
</style> 