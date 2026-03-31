<template>
  <div class="cart-page">
    <el-card>
      <template #header>
        <span>🛒 购物车 ({{ cartItems.length }}件)</span>
      </template>

      <el-table :data="cartItems">
        <el-table-column width="50">
          <template #default>
            <el-checkbox />
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="300">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.image" class="product-image" fit="cover" />
              <div class="product-info">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-sku">{{ row.color }} / {{ row.size }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="数量" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="{ row }">
            <span class="subtotal">¥{{ row.price * row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="cart-footer">
        <div class="cart-total">
          合计: <span class="total-price">¥{{ totalPrice }}</span>
        </div>
        <el-button type="primary" size="large" @click="goToCheckout">去结算</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cartItems = ref([
  { id: 1, name: '经典款T恤男女同款', color: '白色', size: 'M', price: 59, quantity: 2, image: 'https://picsum.photos/80/80?random=cart1' },
  { id: 2, name: '纯棉休闲裤男', color: '黑色', size: '32', price: 99, quantity: 1, image: 'https://picsum.photos/80/80?random=cart2' }
])

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const goToCheckout = () => {
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page { padding: 0; }
.product-cell { display: flex; align-items: center; gap: 12px; }
.product-image { width: 60px; height: 60px; border-radius: 4px; }
.product-name { font-size: 14px; color: #303133; }
.product-sku { font-size: 12px; color: #909399; margin-top: 4px; }
.subtotal { color: #F56C6C; font-weight: bold; }
.cart-footer { display: flex; justify-content: flex-end; align-items: center; gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
.cart-total { font-size: 16px; }
.total-price { color: #F56C6C; font-size: 24px; font-weight: bold; }
</style>