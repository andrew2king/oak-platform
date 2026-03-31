<template>
  <div class="sales-analysis">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>销售分析</span>
          <div>
            <el-date-picker v-model="dateRange" type="daterange" style="width: 240px" />
            <el-button type="primary" @click="handleExport">导出报表</el-button>
          </div>
        </div>
      </template>

      <!-- 核心指标 -->
      <el-row :gutter="16" class="core-stats">
        <el-col :span="4">
          <div class="stat-card primary">
            <div class="stat-value">¥{{ formatMoney(stats.totalAmount) }}</div>
            <div class="stat-label">销售总额</div>
            <div class="stat-trend up">↑ 12.5%</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card success">
            <div class="stat-value">{{ stats.orderCount.toLocaleString() }}</div>
            <div class="stat-label">订单数量</div>
            <div class="stat-trend up">↑ 8.3%</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card warning">
            <div class="stat-value">¥{{ stats.avgOrderAmount }}</div>
            <div class="stat-label">客单价</div>
            <div class="stat-trend up">↑ 3.2%</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card danger">
            <div class="stat-value">{{ stats.memberCount.toLocaleString() }}</div>
            <div class="stat-label">消费人数</div>
            <div class="stat-trend up">↑ 5.6%</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card info">
            <div class="stat-value">{{ stats.productCount.toLocaleString() }}</div>
            <div class="stat-label">动销商品</div>
            <div class="stat-trend down">↓ 2.1%</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-value">{{ stats.conversionRate }}%</div>
            <div class="stat-label">转化率</div>
            <div class="stat-trend up">↑ 1.8%</div>
          </div>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>销售趋势</span>
                <el-radio-group v-model="chartType" size="small">
                  <el-radio-button label="amount">销售额</el-radio-button>
                  <el-radio-button label="order">订单数</el-radio-button>
                  <el-radio-button label="member">消费人数</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <div class="trend-chart">
                <div class="chart-bars">
                  <div v-for="(item, index) in trendData" :key="index" class="bar-item">
                    <div class="bar-value">¥{{ formatMoney(item.amount) }}</div>
                    <div class="bar" :style="{ height: getBarHeight(item.amount) + '%' }"></div>
                    <div class="bar-label">{{ item.date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>销售渠道分布</span>
            </template>
            <div class="pie-container">
              <div class="pie-chart"></div>
              <div class="pie-legend">
                <div v-for="(item, index) in channelData" :key="index" class="legend-item">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.name }}</span>
                  <span class="legend-value">{{ item.percentage }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 区域销售分析 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>区域销售排行</span>
            </template>
            <el-table :data="regionData" size="small" border>
              <el-table-column width="50">
                <template #default="{ $index }">
                  <span :class="['rank', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="区域" />
              <el-table-column label="销售额" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column label="占比" width="80">
                <template #default="{ row }">
                  <el-progress :percentage="row.percentage" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="环比" width="80">
                <template #default="{ row }">
                  <span :class="row.trend > 0 ? 'up' : 'down'">{{ row.trend > 0 ? '↑' : '↓' }}{{ Math.abs(row.trend) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>门店销售排行</span>
            </template>
            <el-table :data="storeData" size="small" border>
              <el-table-column width="50">
                <template #default="{ $index }">
                  <span :class="['rank', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="门店" />
              <el-table-column label="销售额" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column label="订单数" align="center">
                <template #default="{ row }">{{ row.orders.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column label="环比" width="80">
                <template #default="{ row }">
                  <span :class="row.trend > 0 ? 'up' : 'down'">{{ row.trend > 0 ? '↑' : '↓' }}{{ Math.abs(row.trend) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- 时段分析 -->
      <el-card style="margin-top: 20px">
        <template #header>
          <span>时段销售分析</span>
        </template>
        <div class="time-analysis">
          <div class="time-bar-container">
            <div v-for="(item, index) in timeData" :key="index" class="time-bar-item">
              <div class="time-label">{{ item.time }}</div>
              <div class="time-bar" :style="{ width: item.percentage + '%', background: getGradient(index) }"></div>
              <div class="time-value">{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const dateRange = ref([])
const chartType = ref('amount')

const stats = ref({
  totalAmount: 12345678,
  orderCount: 12567,
  avgOrderAmount: 356,
  memberCount: 8956,
  productCount: 2345,
  conversionRate: 15.6
})

const trendData = ref([
  { date: '03/24', amount: 156789 },
  { date: '03/25', amount: 178945 },
  { date: '03/26', amount: 145678 },
  { date: '03/27', amount: 198765 },
  { date: '03/28', amount: 167890 },
  { date: '03/29', amount: 234567 },
  { date: '03/30', amount: 189456 }
])

const channelData = ref([
  { name: '小程序', percentage: 45, color: '#409EFF' },
  { name: 'APP', percentage: 25, color: '#67C23A' },
  { name: '门店', percentage: 20, color: '#E6A23C' },
  { name: 'H5', percentage: 10, color: '#F56C6C' }
])

const regionData = ref([
  { name: '华东区', amount: 4567890, percentage: 37, trend: 15.2 },
  { name: '华南区', amount: 3456789, percentage: 28, trend: 8.5 },
  { name: '华北区', amount: 2345678, percentage: 19, trend: -2.3 },
  { name: '西南区', amount: 1234567, percentage: 10, trend: 12.8 },
  { name: '其他', amount: 745654, percentage: 6, trend: 5.6 }
])

const storeData = ref([
  { name: '上海静安店', amount: 567890, orders: 1234, trend: 18.5 },
  { name: '北京朝阳店', amount: 456789, orders: 987, trend: 12.3 },
  { name: '广州天河店', amount: 345678, orders: 856, trend: 8.9 },
  { name: '深圳福田店', amount: 234567, orders: 567, trend: -5.6 },
  { name: '成都锦江店', amount: 178901, orders: 432, trend: 15.8 }
])

const timeData = ref([
  { time: '08-10', percentage: 8 },
  { time: '10-12', percentage: 15 },
  { time: '12-14', percentage: 12 },
  { time: '14-16', percentage: 18 },
  { time: '16-18', percentage: 22 },
  { time: '18-20', percentage: 28 },
  { time: '20-22', percentage: 35 },
  { time: '22-24', percentage: 20 }
])

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const maxAmount = Math.max(...trendData.value.map(i => i.amount))
const getBarHeight = (amount: number) => (amount / maxAmount) * 100

const getGradient = (index: number) => {
  const colors = ['#409EFF', '#66b1ff', '#67C23A', '#85ce61', '#E6A23C', '#ebb563', '#F56C6C', '#f78989']
  return colors[index % colors.length]
}

const handleExport = () => {
  ElMessage.success('正在导出销售报表...')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.core-stats {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 8px 0 0 8px;
}

.stat-card.primary::before { background: #409EFF; }
.stat-card.success::before { background: #67C23A; }
.stat-card.warning::before { background: #E6A23C; }
.stat-card.danger::before { background: #F56C6C; }
.stat-card.info::before { background: #909399; }
.stat-card::before { background: #667eea; }

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 8px;
}

.stat-trend.up { color: #67C23A; }
.stat-trend.down { color: #F56C6C; }

.chart-container {
  height: 280px;
}

.trend-chart {
  height: 100%;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  height: 100%;
  align-items: flex-end;
  padding-bottom: 30px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 10%;
}

.bar-value {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.bar {
  width: 100%;
  max-width: 30px;
  background: linear-gradient(180deg, #409EFF, #66b1ff);
  border-radius: 4px 4px 0 0;
}

.bar-label {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.pie-container {
  height: 250px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#409EFF 0% 45%, #67C23A 45% 70%, #E6A23C 70% 90%, #F56C6C 90% 100%);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  font-size: 13px;
  color: #606266;
}

.legend-value {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.rank {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #909399;
}

.rank.rank-1 { background: #F56C6C; color: #fff; }
.rank.rank-2 { background: #E6A23C; color: #fff; }
.rank.rank-3 { background: #67C23A; color: #fff; }

.up { color: #67C23A; }
.down { color: #F56C6C; }

.time-analysis {
  padding: 20px;
}

.time-bar-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-bar-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-label {
  width: 60px;
  font-size: 13px;
  color: #606266;
}

.time-bar {
  height: 20px;
  border-radius: 4px;
}

.time-value {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}
</style>