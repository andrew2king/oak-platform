<template>
  <div class="orders-page">
    <el-card>
      <template #header>
        <span>📋 我的订单</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="unpaid" />
        <el-tab-pane label="待发货" name="unshipped" />
        <el-tab-pane label="待收货" name="unreceived" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>

      <div class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <span>订单号: {{ order.orderNo }}</span>
            <span>{{ order.createTime }}</span>
            <el-tag :type="getStatusType(order.status)">{{ order.statusText }}</el-tag>
          </div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <el-image :src="item.image" class="item-image" fit="cover" />
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-sku">{{ item.sku }}</div>
              </div>
              <div class="item-price">¥{{ item.price }}</div>
              <div class="item-quantity">x{{ item.quantity }}</div>
            </div>
          </div>
          <div class="order-footer">
            <span>共 {{ order.totalQuantity }}件商品 实付: <b>¥{{ order.totalAmount }}</b></span>
            <div class="order-actions">
              <el-button v-if="order.status === 'unpaid'" type="primary" size="small">立即付款</el-button>
              <el-button v-if="order.status === 'unreceived'" type="primary" size="small">确认收货</el-button>
              <el-button size="small">查看详情</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('all')

const orders = ref([
  { id: 1, orderNo: 'O202603310001', createTime: '2026-03-31 10:30', status: 'unshipped', statusText: '待发货', totalQuantity: 2, totalAmount: 217, items: [
    { id: 1, name: '经典款T恤男女同款', sku: '白色/M', price: 59, quantity: 2, image: 'https://picsum.photos/60/60?random=order1' },
    { id: 2, name: '纯棉休闲裤男', sku: '黑色/32', price: 99, quantity: 1, image: 'https://picsum.photos/60/60?random=order2' }
  ]},
  { id: 2, orderNo: 'O202603300001', createTime: '2026-03-30 15:20', status: 'completed', statusText: '已完成', totalQuantity: 1, totalAmount: 129, items: [
    { id: 3, name: '女士碎花连衣裙', sku: '粉色/S', price: 129, quantity: 1, image: 'https://picsum.photos/60/60?random=order3' }
  ]}
])

const getStatusType = (status: string) => {
  const types: Record<string, string> = { unpaid: 'warning', unshipped: 'primary', unreceived: 'info', completed: 'success' }
  return types[status] || 'info'
}
</script>

<style scoped>
.order-card { border: 1px solid #eee; border-radius: 8px; margin-bottom: 16px; }
.order-header { background: #f5f7fa; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #606266; }
.order-items { padding: 16px; }
.order-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.order-item:last-child { margin-bottom: 0; }
.item-image { width: 60px; height: 60px; border-radius: 4px; }
.item-info { flex: 1; }
.item-name { font-size: 14px; color: #303133; }
.item-sku { font-size: 12px; color: #909399; margin-top: 4px; }
.item-price { color: #303133; }
.item-quantity { color: #909399; }
.order-footer { padding: 12px 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.order-footer b { color: #F56C6C; font-size: 18px; }
.order-actions { display: flex; gap: 8px; }
</style>