<template>
  <div class="member-analysis">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员分析</span>
          <div>
            <el-date-picker v-model="dateRange" type="daterange" style="width: 240px" />
            <el-button type="primary" @click="handleExport">导出报表</el-button>
          </div>
        </div>
      </template>

      <!-- 核心指标 -->
      <el-row :gutter="16" class="core-stats">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409EFF"><el-icon><User /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalMembers.toLocaleString() }}</div>
              <div class="stat-label">会员总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A"><el-icon><UserFilled /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activeMembers.toLocaleString() }}</div>
              <div class="stat-label">活跃会员</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C"><el-icon><Plus /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.newMembers.toLocaleString() }}</div>
              <div class="stat-label">新增会员</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C"><el-icon><Money /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(stats.totalAmount) }}</div>
              <div class="stat-label">消费总额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #9b59b6"><el-icon><Wallet /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.avgAmount }}</div>
              <div class="stat-label">人均消费</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea"><el-icon><Refresh /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.retentionRate }}%</div>
              <div class="stat-label">留存率</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 会员增长趋势 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="16">
          <el-card>
            <template #header>
              <span>会员增长趋势</span>
            </template>
            <div class="chart-container">
              <div class="trend-chart">
                <div class="chart-bars">
                  <div v-for="(item, index) in growthData" :key="index" class="bar-group">
                    <div class="bar-wrapper">
                      <div class="bar new" :style="{ height: getBarHeight(item.newMembers, maxNew) + '%' }"></div>
                      <div class="bar total" :style="{ height: getBarHeight(item.activeMembers, maxActive) + '%' }"></div>
                    </div>
                    <div class="bar-label">{{ item.month }}</div>
                  </div>
                </div>
                <div class="chart-legend">
                  <span class="legend-item"><span class="legend-color new"></span>新增会员</span>
                  <span class="legend-item"><span class="legend-color total"></span>活跃会员</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>会员等级分布</span>
            </template>
            <div class="level-distribution">
              <div class="pie-chart"></div>
              <div class="level-legend">
                <div v-for="(item, index) in levelData" :key="index" class="legend-item">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.name }}</span>
                  <span class="legend-value">{{ item.count.toLocaleString() }}人</span>
                  <span class="legend-percent">{{ item.percentage }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 消费分析 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>消费金额分布</span>
            </template>
            <div class="consume-distribution">
              <div v-for="(item, index) in consumeData" :key="index" class="consume-item">
                <div class="consume-range">{{ item.range }}</div>
                <div class="consume-info">
                  <div class="consume-meta">
                    <span>{{ item.count.toLocaleString() }}人</span>
                    <span>{{ item.percentage }}%</span>
                  </div>
                  <el-progress :percentage="item.percentage" :stroke-width="10" :color="item.color" />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>会员活跃度分析</span>
            </template>
            <div class="activity-funnel">
              <div v-for="(item, index) in funnelData" :key="index" class="funnel-item" :style="{ width: item.percentage + '%' }">
                <span class="funnel-label">{{ item.label }}</span>
                <span class="funnel-value">{{ item.value.toLocaleString() }}</span>
              </div>
            </div>
            <div class="funnel-legend">
              <span>活跃度定义: 近7天登录为活跃</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- RFM分析 -->
      <el-card style="margin-top: 20px">
        <template #header>
          <span>RFM客户分群</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="6" v-for="(segment, index) in rfmSegments" :key="index">
            <div class="rfm-card" :class="segment.type">
              <div class="rfm-icon">{{ segment.icon }}</div>
              <div class="rfm-content">
                <div class="rfm-name">{{ segment.name }}</div>
                <div class="rfm-count">{{ segment.count.toLocaleString() }}人</div>
                <div class="rfm-percentage">占比 {{ segment.percentage }}%</div>
                <div class="rfm-desc">{{ segment.desc }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="rfm-actions">
          <el-button type="primary">查看RFM详情</el-button>
          <el-button>重新计算RFM</el-button>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, UserFilled, Plus, Money, Wallet, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const dateRange = ref([])

const stats = ref({
  totalMembers: 89543,
  activeMembers: 23456,
  newMembers: 356,
  totalAmount: 45678901,
  avgAmount: 456,
  retentionRate: 68.5
})

const growthData = ref([
  { month: '1月', newMembers: 2345, activeMembers: 12345 },
  { month: '2月', newMembers: 3456, activeMembers: 14567 },
  { month: '3月', newMembers: 4567, activeMembers: 16789 },
  { month: '4月', newMembers: 3890, activeMembers: 18901 },
  { month: '5月', newMembers: 4123, activeMembers: 20123 },
  { month: '6月', newMembers: 5678, activeMembers: 23456 }
])

const maxNew = computed(() => Math.max(...growthData.value.map(i => i.newMembers)))
const maxActive = computed(() => Math.max(...growthData.value.map(i => i.activeMembers)))

const levelData = ref([
  { name: '普通会员', count: 55897, percentage: 62.4, color: '#3498db' },
  { name: '银卡会员', count: 23456, percentage: 26.2, color: '#95a5a6' },
  { name: '金卡会员', count: 8956, percentage: 10, color: '#f1c40f' },
  { name: '钻石会员', count: 1234, percentage: 1.4, color: '#9b59b6' }
])

const consumeData = ref([
  { range: '0-100元', count: 34567, percentage: 38.6, color: '#909399' },
  { range: '100-500元', count: 23456, percentage: 26.2, color: '#409EFF' },
  { range: '500-1000元', count: 15678, percentage: 17.5, color: '#E6A23C' },
  { range: '1000-5000元', count: 8901, percentage: 9.9, color: '#67C23A' },
  { range: '5000元以上', count: 5678, percentage: 7.8, color: '#F56C6C' }
])

const funnelData = ref([
  { label: '注册会员', value: 89543, percentage: 100 },
  { label: '有消费', value: 56789, percentage: 63 },
  { label: '活跃会员', value: 23456, percentage: 26 },
  { label: '高价值', value: 8901, percentage: 10 }
])

const rfmSegments = ref([
  { name: '重要价值', type: 'vip', icon: '👑', count: 5678, percentage: 6.3, desc: '最近消费，频次高，金额大' },
  { name: '重要发展', type: 'growth', icon: '📈', count: 8901, percentage: 9.9, desc: '最近消费，频次低，金额大' },
  { name: '重要保持', type: 'keep', icon: '💎', count: 12345, percentage: 13.8, desc: '最近未消费，频次高，金额大' },
  { name: '一般客户', type: 'normal', icon: '👤', count: 23456, percentage: 26.2, desc: '一般消费行为客户' },
  { name: '低价值客户', type: 'low', icon: '📉', count: 15678, percentage: 17.5, desc: '消费频次低，金额小' },
  { name: '流失风险', type: 'risk', icon: '⚠️', count: 8901, percentage: 9.9, desc: '长时间未消费客户' },
  { name: '新客户', type: 'new', icon: '🌟', count: 7890, percentage: 8.8, desc: '新注册，尚未形成消费习惯' },
  { name: '忠诚客户', type: 'loyal', icon: '❤️', count: 6584, percentage: 7.6, desc: '高频消费，品牌忠诚度高' }
])

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getBarHeight = (value: number, max: number) => (value / max) * 100

const handleExport = () => {
  ElMessage.success('正在导出会员分析报表...')
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
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ebeef5;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.chart-container {
  height: 280px;
}

.trend-chart {
  height: 100%;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  height: 200px;
  align-items: flex-end;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12%;
}

.bar-wrapper {
  display: flex;
  gap: 4px;
  height: 160px;
  align-items: flex-end;
}

.bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
}

.bar.new { background: linear-gradient(180deg, #409EFF, #66b1ff); }
.bar.total { background: linear-gradient(180deg, #67C23A, #85ce61); }

.bar-label {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 10px;
  border-radius: 2px;
}

.legend-color.new { background: #409EFF; }
.legend-color.total { background: #67C23A; }

.level-distribution {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#3498db 0% 62.4%, #95a5a6 62.4% 88.6%, #f1c40f 88.6% 98.6%, #9b59b6 98.6% 100%);
}

.level-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.level-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.level-legend .legend-label {
  flex: 1;
}

.level-legend .legend-value {
  color: #303133;
}

.level-legend .legend-percent {
  color: #909399;
}

.consume-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.consume-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.consume-range {
  width: 100px;
  font-size: 13px;
  color: #303133;
}

.consume-info {
  flex: 1;
}

.consume-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.activity-funnel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
}

.funnel-item {
  background: linear-gradient(90deg, #409EFF, #66b1ff);
  color: #fff;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  min-width: 200px;
}

.funnel-legend {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 12px;
}

.rfm-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.rfm-icon {
  font-size: 28px;
}

.rfm-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.rfm-count {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  margin-top: 4px;
}

.rfm-percentage {
  font-size: 12px;
  color: #909399;
}

.rfm-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.rfm-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>