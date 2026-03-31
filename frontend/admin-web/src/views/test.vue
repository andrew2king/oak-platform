<template>
  <div class="test-page">
    <h1>✅ Oak Platform 加载成功!</h1>
    <p>如果你看到这个页面，说明Vue和ElementPlus正常工作。</p>
    <el-button type="primary" @click="count++">点击次数: {{ count }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
h1 { color: #409EFF; margin-bottom: 20px; }
p { color: #666; margin-bottom: 20px; }
</style>