<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">
            <el-icon :size="32"><ShoppingBag /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.productCount) }}</div>
            <div class="stat-label">商品总数</div>
          </div>
          <div class="stat-footer">
            <span>今日新增 <b>+128</b></span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-success">
          <div class="stat-icon">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.orderCount) }}</div>
            <div class="stat-label">今日订单</div>
          </div>
          <div class="stat-footer">
            <span>较昨日 <b class="up">+12.5%</b></span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-warning">
          <div class="stat-icon">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.memberCount) }}</div>
            <div class="stat-label">会员总数</div>
          </div>
          <div class="stat-footer">
            <span>今日新增 <b>+356</b></span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-danger">
          <div class="stat-icon">
            <el-icon :size="32"><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatMoney(stats.todayAmount) }}</div>
            <div class="stat-label">今日销售额</div>
          </div>
          <div class="stat-footer">
            <span>较昨日 <b class="up">+8.3%</b></span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div class="simple-chart">
              <div class="chart-bars">
                <div v-for="(item, index) in stats.orderTrend" :key="index" class="bar-item">
                  <div class="bar-value">¥{{ formatMoney(item.amount) }}</div>
                  <div class="bar" :style="{ height: getBarHeight(item.amount, maxAmount) + '%' }"></div>
                  <div class="bar-label">{{ item.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <span>品类销售分布</span>
          </template>
          <div class="category-list">
            <div v-for="(item, index) in stats.categorySales" :key="index" class="category-item">
              <div class="category-info">
                <span class="category-name">{{ item.name }}</span>
                <span class="category-value">¥{{ formatMoney(item.value) }}</span>
              </div>
              <el-progress
                :percentage="getPercentage(item.value, totalCategorySales)"
                :stroke-width="8"
                :color="colors[index % colors.length]"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 列表区域 -->
    <el-row :gutter="20" class="list-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🔥 热销商品 TOP10</span>
              <el-button link type="primary">查看更多</el-button>
            </div>
          </template>
          <el-table :data="stats.topProducts" size="small" :show-header="false">
            <el-table-column width="50">
              <template #default="{ $index }">
                <span :class="['rank-badge', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="{ row }">
                <div class="product-info">
                  <el-image :src="row.image || defaultImage" class="product-image" fit="cover" />
                  <div class="product-detail">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-sales">销量: {{ row.sales }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column width="100" align="right">
              <template #default="{ row }">
                <span class="product-amount">¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📋 最新订单</span>
              <el-button link type="primary">查看更多</el-button>
            </div>
          </template>
          <el-table :data="stats.recentOrders" size="small">
            <el-table-column prop="orderNo" label="订单号" width="140" />
            <el-table-column prop="member" label="会员" width="80" />
            <el-table-column label="金额" width="80">
              <template #default="{ row }">
                ¥{{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="orderStatusMap[row.status]?.type" size="small">
                  {{ orderStatusMap[row.status]?.text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 消息通知 -->
    <el-row :gutter="20" class="alert-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🔔 系统通知</span>
              <el-button link type="primary">全部已读</el-button>
            </div>
          </template>
          <div class="alert-list">
            <div v-for="(alert, index) in stats.alerts" :key="index" class="alert-item">
              <el-icon :class="['alert-icon', `alert-${alert.type}`]">
                <Warning v-if="alert.type === 'warning'" />
                <CircleClose v-if="alert.type === 'error'" />
                <InfoFilled v-if="alert.type === 'info'" />
                <CircleCheck v-if="alert.type === 'success'" />
              </el-icon>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-desc">{{ alert.desc }}</div>
              </div>
              <div class="alert-time">{{ alert.time }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ShoppingBag, Document, User, Coin, Warning, CircleClose, InfoFilled, CircleCheck } from '@element-plus/icons-vue'
import Mock from '@/mock'

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23f0f0f0" width="40" height="40"/%3E%3C/svg%3E'

const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

const orderStatusMap: Record<number, { text: string; type: string }> = {
  1: { text: '待支付', type: 'warning' },
  2: { text: '已支付', type: 'primary' },
  3: { text: '已发货', type: 'info' },
  4: { text: '已完成', type: 'success' }
}

const stats = ref<any>({
    productCount: 0,
    orderCount: 0,
    memberCount: 0,
    todayAmount: 0,
    orderTrend: [],
    categorySales: [],
    topProducts: [],
    recentOrders: [],
    alerts: []
  })
const chartType = ref('week')

const maxAmount = computed(() => Math.max(...(stats.value.orderTrend?.map((i: any) => i.amount) || [])))
const totalCategorySales = computed(() => stats.value.categorySales?.reduce((sum: number, i: any) => sum + i.value, 0) || 0)

onMounted(() => {
  stats.value = Mock.getDashboardStats()
})

const formatNumber = (num: number) => {
  if (!num && num !== 0) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const formatMoney = (num: number) => {
  if (!num && num !== 0) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getBarHeight = (value: number, max: number) => {
  if (!max || !value) return 0
  return (value / max) * 100
}

const getPercentage = (value: number, total: number) => {
  if (!total || !value) return 0
  return Math.round((value / total) * 100)
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card-primary::before { background: #409EFF; }
.stat-card-success::before { background: #67C23A; }
.stat-card-warning::before { background: #E6A23C; }
.stat-card-danger::before { background: #F56C6C; }

.stat-icon {
  float: left;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card-primary .stat-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.stat-card-success .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.stat-card-warning .stat-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
.stat-card-danger .stat-icon { background: linear-gradient(135deg, #F56C6C, #f78989); }

.stat-info {
  margin-left: 70px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-footer {
  clear: both;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
  font-size: 12px;
  color: #909399;
}

.stat-footer b { color: #303133; }
.stat-footer b.up { color: #67C23A; }

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 380px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 280px;
}

.simple-chart {
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  align-items: flex-end;
  padding-bottom: 30px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12%;
}

.bar-value {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, #409EFF, #66b1ff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.bar-label {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.category-list {
  padding: 10px 0;
}

.category-item {
  margin-bottom: 16px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.category-name {
  font-size: 14px;
  color: #606266;
}

.category-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.list-row {
  margin-bottom: 20px;
}

.rank-badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background: #f0f0f0;
  color: #909399;
}

.rank-badge.rank-1 { background: #ff6b6b; color: #fff; }
.rank-badge.rank-2 { background: #ffa940; color: #fff; }
.rank-badge.rank-3 { background: #ffc53d; color: #fff; }

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #f5f7fa;
}

.product-detail {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.product-sales {
  font-size: 12px;
  color: #909399;
}

.product-amount {
  font-size: 14px;
  font-weight: 500;
  color: #F56C6C;
}

.alert-row {
  margin-bottom: 20px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.alert-icon {
  font-size: 20px;
  margin-top: 2px;
}

.alert-icon.alert-warning { color: #E6A23C; }
.alert-icon.alert-error { color: #F56C6C; }
.alert-icon.alert-info { color: #409EFF; }
.alert-icon.alert-success { color: #67C23A; }

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.alert-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.alert-time {
  font-size: 12px;
  color: #C0C4CC;
}
</style>