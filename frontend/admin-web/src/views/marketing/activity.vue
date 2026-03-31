<template>
  <div class="marketing-center">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <el-icon :size="28"><Present /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activityStats.total }}</div>
            <div class="stat-label">活动总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <el-icon :size="28"><Ticket /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ couponStats.used }}</div>
            <div class="stat-label">优惠券使用</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activityStats.participants }}</div>
            <div class="stat-label">参与人数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <el-icon :size="28"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatMoney(activityStats.amount) }}</div>
            <div class="stat-label">营销产出</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 活动管理 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🎯 营销活动</span>
              <el-button type="primary" size="small">新建活动</el-button>
            </div>
          </template>
          <el-table :data="activities" size="small">
            <el-table-column prop="name" label="活动名称" min-width="120" />
            <el-table-column prop="type" label="类型" width="70">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="180">
              <template #default="{ row }">
                <div class="time-cell">
                  <div>{{ row.startTime }}</div>
                  <div>至 {{ row.endTime }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="70">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '进行中' : '已结束' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="效果" width="120">
              <template #default="{ row }">
                <div class="effect-cell">
                  <div>参与: {{ row.participants }}</div>
                  <div>订单: {{ row.orders }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 优惠券管理 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🎫 优惠券</span>
              <el-button type="primary" size="small">创建优惠券</el-button>
            </div>
          </template>
          <el-table :data="coupons" size="small">
            <el-table-column prop="name" label="券名称" min-width="100" />
            <el-table-column label="优惠" width="100">
              <template #default="{ row }">
                <span class="coupon-amount">
                  <template v-if="row.type === '折扣'">{{ row.amount }}折</template>
                  <template v-else-if="row.type === '免邮'">免运费</template>
                  <template v-else>¥{{ row.amount }}</template>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="condition" label="使用条件" width="90" />
            <el-table-column label="使用率" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="Math.round(row.usedCount / row.totalCount * 100)"
                  :stroke-width="10"
                />
              </template>
            </el-table-column>
            <el-table-column label="有效期" width="160">
              <template #default="{ row }">
                <div class="time-cell">
                  <div>{{ row.startTime }}</div>
                  <div>至 {{ row.endTime }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 限时秒杀 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>⚡ 限时秒杀</span>
              <div>
                <el-tag type="danger" effect="dark">
                  <el-icon><Clock /></el-icon>
                  今日 20:00 场
                </el-tag>
              </div>
            </div>
          </template>
          <div class="seckill-list">
            <div v-for="item in seckillProducts" :key="item.id" class="seckill-item">
              <el-image :src="item.image" class="seckill-image" fit="cover" />
              <div class="seckill-info">
                <div class="seckill-name">{{ item.name }}</div>
                <div class="seckill-price">
                  <span class="seckill-price-now">¥{{ item.seckillPrice }}</span>
                  <span class="seckill-price-old">¥{{ item.originalPrice }}</span>
                </div>
                <div class="seckill-stock">
                  <el-progress
                    :percentage="item.soldPercent"
                    :stroke-width="6"
                    :show-text="false"
                    color="#F56C6C"
                  />
                  <span>已抢{{ item.soldPercent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 拼团活动 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>👥 拼团活动</span>
              <el-button type="primary" size="small">创建拼团</el-button>
            </div>
          </template>
          <el-table :data="groupProducts" size="small">
            <el-table-column label="商品" min-width="150">
              <template #default="{ row }">
                <div class="product-cell">
                  <el-image :src="row.image" class="product-image" fit="cover" />
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="拼团价" width="80">
              <template #default="{ row }">
                <span class="group-price">¥{{ row.groupPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="groupSize" label="成团人数" width="80" align="center" />
            <el-table-column label="进行中" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.activeGroups }}团</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="已成团" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="success">{{ row.completedGroups }}团</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 营销效果分析 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>📊 营销效果分析</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="chart-placeholder">
                <div class="chart-title">活动参与趋势</div>
                <div class="chart-mock">
                  <div class="bar-chart">
                    <div v-for="(h, i) in [60, 75, 45, 80, 65, 90, 70]" :key="i" class="bar" :style="{ height: h + '%' }"></div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="chart-placeholder">
                <div class="chart-title">优惠券使用分布</div>
                <div class="chart-mock pie">
                  <div class="pie-chart"></div>
                  <div class="pie-legend">
                    <span>满减券 45%</span>
                    <span>折扣券 30%</span>
                    <span>免邮券 25%</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="chart-placeholder">
                <div class="chart-title">转化率漏斗</div>
                <div class="funnel-chart">
                  <div class="funnel-item" style="width: 100%">浏览 12,345</div>
                  <div class="funnel-item" style="width: 75%">参与 8,456</div>
                  <div class="funnel-item" style="width: 50%">下单 4,567</div>
                  <div class="funnel-item" style="width: 35%">支付 3,210</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Present, Ticket, User, Money, Clock } from '@element-plus/icons-vue'
import Mock from '@/mock'

const activityStats = ref({
  total: 15,
  participants: 86789,
  amount: 2345678
})

const couponStats = ref({
  total: 46000,
  used: 32456
})

const activities = ref(Mock.getActivities())
const coupons = ref(Mock.getCoupons())

const seckillProducts = ref([
  { id: 1, name: '经典款T恤男女同款', image: 'https://picsum.photos/80/80?random=1', seckillPrice: 59, originalPrice: 99, soldPercent: 85 },
  { id: 2, name: '纯棉休闲裤男', image: 'https://picsum.photos/80/80?random=2', seckillPrice: 99, originalPrice: 199, soldPercent: 72 },
  { id: 3, name: '女士碎花连衣裙', image: 'https://picsum.photos/80/80?random=3', seckillPrice: 129, originalPrice: 299, soldPercent: 68 },
  { id: 4, name: '运动鞋男款透气', image: 'https://picsum.photos/80/80?random=4', seckillPrice: 159, originalPrice: 359, soldPercent: 91 }
])

const groupProducts = ref([
  { id: 1, name: '男士商务衬衫', image: 'https://picsum.photos/60/60?random=5', groupPrice: 89, originalPrice: 159, groupSize: 2, activeGroups: 56, completedGroups: 234 },
  { id: 2, name: '女士针织开衫', image: 'https://picsum.photos/60/60?random=6', groupPrice: 119, originalPrice: 199, groupSize: 3, activeGroups: 34, completedGroups: 156 },
  { id: 3, name: '儿童纯棉T恤', image: 'https://picsum.photos/60/60?random=7', groupPrice: 39, originalPrice: 69, groupSize: 2, activeGroups: 89, completedGroups: 567 }
])

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-cell {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.effect-cell {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.coupon-amount {
  color: #F56C6C;
  font-weight: bold;
}

.seckill-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.seckill-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.seckill-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}

.seckill-info {
  flex: 1;
}

.seckill-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.seckill-price-now {
  font-size: 18px;
  font-weight: bold;
  color: #F56C6C;
}

.seckill-price-old {
  font-size: 12px;
  color: #C0C4CC;
  text-decoration: line-through;
  margin-left: 8px;
}

.seckill-stock {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
}

.seckill-stock .el-progress {
  flex: 1;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.group-price {
  color: #F56C6C;
  font-weight: bold;
}

.chart-placeholder {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #303133;
}

.chart-mock {
  height: 180px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 20px;
}

.bar-chart .bar {
  width: 30px;
  background: linear-gradient(180deg, #409EFF, #66b1ff);
  border-radius: 4px 4px 0 0;
}

.chart-mock.pie {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#409EFF 0% 45%, #67C23A 45% 75%, #E6A23C 75% 100%);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}

.funnel-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.funnel-item {
  background: linear-gradient(90deg, #409EFF, #66b1ff);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
</style>