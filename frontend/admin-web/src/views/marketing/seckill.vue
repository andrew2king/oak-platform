<template>
  <div class="seckill-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>限时秒杀管理</span>
          <el-button type="primary" @click="handleCreateSeckill">创建秒杀活动</el-button>
        </div>
      </template>

      <!-- 秒杀场次时间轴 -->
      <div class="seckill-timeline">
        <div class="timeline-header">
          <span>今日秒杀场次</span>
          <el-tag type="danger" effect="dark">
            <el-icon><Clock /></el-icon>
            {{ currentTime }}
          </el-tag>
        </div>
        <div class="timeline-body">
          <div v-for="session in sessions" :key="session.id" class="session-item" :class="getSessionClass(session)">
            <div class="session-time">{{ session.time }}</div>
            <div class="session-status">{{ session.status }}</div>
            <div class="session-count">{{ session.productCount }}款商品</div>
          </div>
        </div>
      </div>

      <!-- 统计概览 -->
      <el-row :gutter="16" class="seckill-stats">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon hot">
              <el-icon><Fire /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ seckillStats.totalActivities }}</div>
              <div class="stat-label">活动总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ seckillStats.activeProducts }}</div>
              <div class="stat-label">进行中商品</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ seckillStats.participants.toLocaleString() }}</div>
              <div class="stat-label">参与人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon orders">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ seckillStats.orders.toLocaleString() }}</div>
              <div class="stat-label">秒杀订单</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(seckillStats.amount) }}</div>
              <div class="stat-label">秒杀销售额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon rate">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ seckillStats.sellRate }}%</div>
              <div class="stat-label">平均售罄率</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="活动场次">
          <el-select v-model="queryParams.session" placeholder="选择场次" clearable style="width: 150px">
            <el-option label="10:00场" value="10:00" />
            <el-option label="12:00场" value="12:00" />
            <el-option label="14:00场" value="14:00" />
            <el-option label="16:00场" value="16:00" />
            <el-option label="20:00场" value="20:00" />
            <el-option label="22:00场" value="22:00" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="进行中" value="active" />
            <el-option label="已售罄" value="sold" />
            <el-option label="已结束" value="ended" />
            <el-option label="待开始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="queryParams.date" type="date" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 秒杀商品列表 -->
      <el-table :data="seckillProducts" v-loading="loading" border>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.image" class="product-image" fit="cover" />
              <div class="product-info">
                <div class="product-name">
                  <el-tag v-if="row.isHot" type="danger" size="small" effect="dark">爆款</el-tag>
                  {{ row.name }}
                </div>
                <div class="product-meta">SKU: {{ row.sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格信息" width="150">
          <template #default="{ row }">
            <div class="price-cell">
              <div class="seckill-price">秒杀价 ¥{{ row.seckillPrice }}</div>
              <div class="original-price">原价 ¥{{ row.originalPrice }}</div>
              <div class="discount">折扣 {{ Math.round(row.seckillPrice / row.originalPrice * 100) / 10 }}折</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存/销量" width="120">
          <template #default="{ row }">
            <div class="stock-cell">
              <div>库存: {{ row.stock }}</div>
              <div>已售: {{ row.sold }}</div>
              <el-progress :percentage="Math.round(row.sold / (row.stock + row.sold) * 100)" :stroke-width="6" color="#F56C6C" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="场次" width="80">
          <template #default="{ row }">
            <el-tag type="danger" effect="plain">{{ row.session }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="限购" width="80" align="center">
          <template #default="{ row }">{{ row.limitCount }}件/人</template>
        </el-table-column>
        <el-table-column label="抢购热度" width="100">
          <template #default="{ row }">
            <div class="heat-cell">
              <el-rate v-model="row.heat" :max="5" disabled />
              <span>{{ row.heat }}星</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getProductStatusType(row.status)">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" v-if="row.status !== 'ended'" @click="handleCancel(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        class="pagination"
      />
    </el-card>

    <!-- 秒杀详情对话框 -->
    <el-dialog v-model="detailVisible" title="秒杀商品详情" width="700px">
      <template v-if="currentProduct">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-image :src="currentProduct.image" style="width: 100%; border-radius: 8px" />
          </el-col>
          <el-col :span="16">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
              <el-descriptions-item label="SKU编码">{{ currentProduct.sku }}</el-descriptions-item>
              <el-descriptions-item label="秒杀价格">¥{{ currentProduct.seckillPrice }}</el-descriptions-item>
              <el-descriptions-item label="原价">¥{{ currentProduct.originalPrice }}</el-descriptions-item>
              <el-descriptions-item label="秒杀库存">{{ currentProduct.stock }}件</el-descriptions-item>
              <el-descriptions-item label="已售数量">{{ currentProduct.sold }}件</el-descriptions-item>
              <el-descriptions-item label="活动场次">{{ currentProduct.session }}</el-descriptions-item>
              <el-descriptions-item label="限购数量">{{ currentProduct.limitCount }}件/人</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>

        <el-divider>实时监控</el-divider>

        <el-row :gutter="16">
          <el-col :span="6">
            <div class="monitor-card">
              <div class="monitor-value">{{ currentProduct.realtimeViews.toLocaleString() }}</div>
              <div class="monitor-label">实时浏览</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="monitor-card">
              <div class="monitor-value">{{ currentProduct.realtimeCart.toLocaleString() }}</div>
              <div class="monitor-label">加入购物车</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="monitor-card">
              <div class="monitor-value">{{ currentProduct.realtimeOrders.toLocaleString() }}</div>
              <div class="monitor-label">下单数量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="monitor-card">
              <div class="monitor-value">{{ currentProduct.realtimeQueue.toLocaleString() }}</div>
              <div class="monitor-label">排队人数</div>
            </div>
          </el-col>
        </el-row>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Clock, Fire, Timer, User, ShoppingCart, Money, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const detailVisible = ref(false)
const currentProduct = ref<any>(null)
const currentTime = ref('14:35')

const queryParams = reactive({
  session: '',
  status: '',
  date: '',
  pageNum: 1,
  pageSize: 10
})

const sessions = ref([
  { id: 1, time: '10:00', status: '已结束', productCount: 8 },
  { id: 2, time: '12:00', status: '已结束', productCount: 6 },
  { id: 3, time: '14:00', status: '抢购中', productCount: 10 },
  { id: 4, time: '16:00', status: '即将开始', productCount: 5 },
  { id: 5, time: '20:00', status: '即将开始', productCount: 12 },
  { id: 6, time: '22:00', status: '即将开始', productCount: 4 }
])

const seckillStats = ref({
  totalActivities: 156,
  activeProducts: 23,
  participants: 23456,
  orders: 5678,
  amount: 456789,
  sellRate: 89
})

const seckillProducts = ref([
  { id: 1, name: '经典款T恤男女同款', sku: 'T001-BL-M', image: 'https://picsum.photos/80/80?random=701', seckillPrice: 59, originalPrice: 99, stock: 50, sold: 45, session: '14:00', limitCount: 1, heat: 5, status: 'active', statusLabel: '进行中', isHot: true },
  { id: 2, name: '纯棉休闲裤男', sku: 'P001-KH-32', image: 'https://picsum.photos/80/80?random=702', seckillPrice: 99, originalPrice: 199, stock: 30, sold: 28, session: '14:00', limitCount: 2, heat: 4, status: 'active', statusLabel: '进行中', isHot: true },
  { id: 3, name: '女士碎花连衣裙', sku: 'D001-PK-S', image: 'https://picsum.photos/80/80?random=703', seckillPrice: 129, originalPrice: 299, stock: 20, sold: 20, session: '14:00', limitCount: 1, heat: 5, status: 'sold', statusLabel: '已售罄', isHot: false },
  { id: 4, name: '运动鞋男款透气', sku: 'S001-WH-42', image: 'https://picsum.photos/80/80?random=704', seckillPrice: 159, originalPrice: 359, stock: 80, sold: 72, session: '14:00', limitCount: 1, heat: 4, status: 'active', statusLabel: '进行中', isHot: false },
  { id: 5, name: '男士商务衬衫', sku: 'S002-WH-41', image: 'https://picsum.photos/80/80?random=705', seckillPrice: 89, originalPrice: 159, stock: 0, sold: 60, session: '10:00', limitCount: 1, heat: 5, status: 'ended', statusLabel: '已结束', isHot: false },
  { id: 6, name: '女士针织开衫', sku: 'C001-GY-M', image: 'https://picsum.photos/80/80?random=706', seckillPrice: 119, originalPrice: 199, stock: 40, sold: 0, session: '16:00', limitCount: 2, heat: 3, status: 'pending', statusLabel: '待开始', isHot: false },
  { id: 7, name: '儿童纯棉T恤', sku: 'K001-YG-L', image: 'https://picsum.photos/80/80?random=707', seckillPrice: 39, originalPrice: 69, stock: 100, sold: 0, session: '20:00', limitCount: 3, heat: 4, status: 'pending', statusLabel: '待开始', isHot: true },
  { id: 8, name: '时尚帆布背包', sku: 'B001-BK', image: 'https://picsum.photos/80/80?random=708', seckillPrice: 49, originalPrice: 99, stock: 50, sold: 45, session: '12:00', limitCount: 1, heat: 4, status: 'ended', statusLabel: '已结束', isHot: false }
])

onMounted(() => {
  total.value = seckillProducts.value.length
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getSessionClass = (session: any) => {
  if (session.status === '抢购中') return 'active'
  if (session.status === '已结束') return 'ended'
  return 'pending'
}

const getProductStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'danger',
    sold: 'warning',
    ended: 'info',
    pending: 'success'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.session = ''
  queryParams.status = ''
  queryParams.date = ''
}

const handleCreateSeckill = () => {
  ElMessage.info('打开创建秒杀活动表单')
}

const handleDetail = (row: any) => {
  currentProduct.value = {
    ...row,
    realtimeViews: 23456,
    realtimeCart: 1567,
    realtimeOrders: 45,
    realtimeQueue: 890
  }
  detailVisible.value = true
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑秒杀商品: ' + row.name)
}

const handleCancel = (row: any) => {
  ElMessageBox.confirm('确定取消该秒杀商品吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('已取消秒杀商品')
    })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seckill-timeline {
  background: linear-gradient(135deg, #F56C6C, #f78989);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: #fff;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-body {
  display: flex;
  gap: 16px;
}

.session-item {
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 12px;
  min-width: 100px;
}

.session-item.active {
  background: rgba(255,255,255,0.4);
  border: 2px solid #fff;
}

.session-time {
  font-size: 18px;
  font-weight: bold;
}

.session-status {
  font-size: 12px;
}

.session-count {
  font-size: 12px;
}

.seckill-stats {
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
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.hot { background: #F56C6C; }
.stat-icon.active { background: #E6A23C; }
.stat-icon.users { background: #409EFF; }
.stat-icon.orders { background: #67C23A; }
.stat-icon.amount { background: #9b59b6; }
.stat-icon.rate { background: #667eea; }

.search-form {
  margin-bottom: 16px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.product-name {
  font-size: 14px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-meta {
  font-size: 12px;
  color: #909399;
}

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.seckill-price {
  color: #F56C6C;
  font-weight: bold;
  font-size: 16px;
}

.original-price {
  font-size: 12px;
  color: #C0C4CC;
  text-decoration: line-through;
}

.discount {
  font-size: 12px;
  color: #E6A23C;
}

.stock-cell {
  font-size: 12px;
  color: #606266;
}

.heat-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.monitor-card {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.monitor-value {
  font-size: 24px;
  font-weight: bold;
  color: #F56C6C;
}

.monitor-label {
  font-size: 13px;
  color: #909399;
}
</style>