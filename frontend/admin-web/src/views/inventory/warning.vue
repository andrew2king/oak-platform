<template>
  <div class="inventory-warning">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存预警管理</span>
          <div>
            <el-button type="primary" @click="handleBatchPurchase">批量采购</el-button>
            <el-button @click="handleExport">导出预警</el-button>
          </div>
        </div>
      </template>

      <!-- 预警统计 -->
      <el-row :gutter="16" class="warning-stats">
        <el-col :span="4">
          <div class="stat-item danger">
            <div class="stat-icon">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ warningStats.critical }}</div>
              <div class="stat-label">严重缺货</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item warning">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ warningStats.low }}</div>
              <div class="stat-label">库存不足</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item info">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ warningStats.expiring }}</div>
              <div class="stat-label">即将过期</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item success">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ warningStats.overstock }}</div>
              <div class="stat-label">库存积压</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item primary">
            <div class="stat-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ warningStats.pendingOrders }}</div>
              <div class="stat-label">待采购</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(warningStats.estimatedCost) }}</div>
              <div class="stat-label">预估采购成本</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="预警类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="严重缺货" value="critical" />
            <el-option label="库存不足" value="low" />
            <el-option label="即将过期" value="expiring" />
            <el-option label="库存积压" value="overstock" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="queryParams.category" placeholder="全部分类" clearable style="width: 150px">
            <el-option label="男装" value="men" />
            <el-option label="女装" value="women" />
            <el-option label="童装" value="kids" />
            <el-option label="配饰" value="accessories" />
          </el-select>
        </el-form-item>
        <el-form-item label="门店">
          <el-select v-model="queryParams.store" placeholder="全部门店" clearable style="width: 180px">
            <el-option label="总部仓库" value="hq" />
            <el-option label="北京朝阳店" value="bj" />
            <el-option label="上海静安店" value="sh" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 预警列表 -->
      <el-table :data="warningList" v-loading="loading" border>
        <el-table-column type="selection" width="50" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.image" class="product-image" fit="cover" />
              <div class="product-info">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-meta">
                  <span>SKU: {{ row.sku }}</span>
                  <span>{{ row.category }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预警类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getWarningType(row.type)" effect="dark">
              {{ getWarningLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前库存" width="100" align="center">
          <template #default="{ row }">
            <span :class="['stock-value', row.type]">{{ row.currentStock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="安全库存" width="100" align="center">
          <template #default="{ row }">{{ row.safeStock }}</template>
        </el-table-column>
        <el-table-column label="建议采购" width="100" align="center">
          <template #default="{ row }">
            <span class="suggest-purchase">{{ row.suggestPurchase }}</span>
          </template>
        </el-table-column>
        <el-table-column label="采购成本" width="120" align="right">
          <template #default="{ row }">
            <span class="cost">¥{{ row.purchaseCost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="门店" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.store }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日均销量" width="80" align="center">
          <template #default="{ row }">{{ row.dailySales }}件</template>
        </el-table-column>
        <el-table-column label="预计断货" width="100">
          <template #default="{ row }">
            <span class="expire-date">{{ row.estimateEmpty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handlePurchase(row)">立即采购</el-button>
            <el-button link type="primary" @click="handleTransfer(row)">调拨</el-button>
            <el-button link type="warning" @click="handleAdjust(row)">调整阈值</el-button>
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

    <!-- 采购单对话框 -->
    <el-dialog v-model="purchaseVisible" title="创建采购单" width="600px">
      <el-form :model="purchaseForm" label-width="100px">
        <el-form-item label="供应商">
          <el-select v-model="purchaseForm.supplier" style="width: 100%">
            <el-option label="杭州服饰供应商" value="hz1" />
            <el-option label="广州服装批发" value="gz1" />
            <el-option label="上海品牌直供" value="sh1" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购数量">
          <el-input-number v-model="purchaseForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="预计到货">
          <el-date-picker v-model="purchaseForm.arrivalDate" type="date" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="purchaseForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="purchaseVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPurchase">确认采购</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { WarningFilled, Warning, Clock, CircleCheck, ShoppingCart, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const purchaseVisible = ref(false)

const queryParams = reactive({
  type: '',
  category: '',
  store: '',
  pageNum: 1,
  pageSize: 10
})

const purchaseForm = reactive({
  supplier: '',
  quantity: 0,
  arrivalDate: '',
  remark: ''
})

const warningStats = ref({
  critical: 23,
  low: 156,
  expiring: 45,
  overstock: 89,
  pendingOrders: 34,
  estimatedCost: 456789
})

const warningList = ref([
  { id: 1, name: '男士纯棉短袖T恤', sku: 'T001-BL-M', image: 'https://picsum.photos/60/60?random=101', category: '男装', type: 'critical', currentStock: 5, safeStock: 50, suggestPurchase: 100, purchaseCost: 5900, store: '北京朝阳店', dailySales: 15, estimateEmpty: '3天后' },
  { id: 2, name: '女士碎花连衣裙', sku: 'D001-PK-S', image: 'https://picsum.photos/60/60?random=102', category: '女装', type: 'critical', currentStock: 3, safeStock: 30, suggestPurchase: 80, purchaseCost: 9600, store: '上海静安店', dailySales: 8, estimateEmpty: '明天' },
  { id: 3, name: '儿童卡通T恤', sku: 'K001-YG-L', image: 'https://picsum.photos/60/60?random=103', category: '童装', type: 'low', currentStock: 25, safeStock: 40, suggestPurchase: 50, purchaseCost: 2500, store: '总部仓库', dailySales: 5, estimateEmpty: '5天后' },
  { id: 4, name: '男士休闲牛仔裤', sku: 'J001-BK-32', image: 'https://picsum.photos/60/60?random=104', category: '男装', type: 'low', currentStock: 18, safeStock: 60, suggestPurchase: 100, purchaseCost: 8900, store: '北京朝阳店', dailySales: 12, estimateEmpty: '1天后' },
  { id: 5, name: '女士针织开衫', sku: 'C001-GY-M', image: 'https://picsum.photos/60/60?random=105', category: '女装', type: 'expiring', currentStock: 120, safeStock: 50, suggestPurchase: 0, purchaseCost: 0, store: '总部仓库', dailySales: 3, estimateEmpty: '过期: 15天后' },
  { id: 6, name: '运动透气跑鞋', sku: 'S001-WH-42', image: 'https://picsum.photos/60/60?random=106', category: '配饰', type: 'overstock', currentStock: 350, safeStock: 80, suggestPurchase: 0, purchaseCost: 0, store: '上海静安店', dailySales: 2, estimateEmpty: '-' },
  { id: 7, name: '商务正装衬衫', sku: 'S002-WH-41', image: 'https://picsum.photos/60/60?random=107', category: '男装', type: 'critical', currentStock: 2, safeStock: 40, suggestPurchase: 60, purchaseCost: 7200, store: '北京朝阳店', dailySales: 10, estimateEmpty: '明天' },
  { id: 8, name: '时尚帆布背包', sku: 'B001-BK', image: 'https://picsum.photos/60/60?random=108', category: '配饰', type: 'low', currentStock: 35, safeStock: 50, suggestPurchase: 30, purchaseCost: 1800, store: '总部仓库', dailySales: 4, estimateEmpty: '9天后' }
])

onMounted(() => {
  total.value = warningList.value.length
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getWarningType = (type: string) => {
  const types: Record<string, string> = {
    critical: 'danger',
    low: 'warning',
    expiring: 'info',
    overstock: 'success'
  }
  return types[type] || 'info'
}

const getWarningLabel = (type: string) => {
  const labels: Record<string, string> = {
    critical: '严重缺货',
    low: '库存不足',
    expiring: '即将过期',
    overstock: '库存积压'
  }
  return labels[type] || '未知'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.type = ''
  queryParams.category = ''
  queryParams.store = ''
}

const handleBatchPurchase = () => {
  ElMessage.success('正在批量创建采购单...')
}

const handleExport = () => {
  ElMessage.success('正在导出预警数据...')
}

const handlePurchase = (row: any) => {
  purchaseForm.quantity = row.suggestPurchase
  purchaseVisible.value = true
}

const handleTransfer = (row: any) => {
  ElMessage.info('调拨商品: ' + row.name)
}

const handleAdjust = (row: any) => {
  ElMessage.info('调整安全库存阈值: ' + row.name)
}

const submitPurchase = () => {
  ElMessage.success('采购单已创建')
  purchaseVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-stats {
  margin-bottom: 20px;
}

.stat-item {
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

.stat-item.danger .stat-icon { background: linear-gradient(135deg, #F56C6C, #f78989); }
.stat-item.warning .stat-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
.stat-item.info .stat-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.stat-item.success .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.stat-item.primary .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-item .stat-icon { background: linear-gradient(135deg, #909399, #a6a9ad); }

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.search-form {
  margin-bottom: 16px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.product-name {
  font-size: 14px;
  color: #303133;
}

.product-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
}

.stock-value.critical { color: #F56C6C; font-weight: bold; }
.stock-value.low { color: #E6A23C; font-weight: bold; }
.stock-value.expiring { color: #409EFF; }
.stock-value.overstock { color: #67C23A; }

.suggest-purchase {
  color: #409EFF;
  font-weight: bold;
}

.cost {
  color: #303133;
  font-weight: 500;
}

.expire-date {
  color: #F56C6C;
  font-size: 12px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>