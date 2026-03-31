<template>
  <div class="inventory-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存查询</span>
          <div>
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出库存
            </el-button>
          </div>
        </div>
      </template>

      <!-- 库存统计 -->
      <el-row :gutter="16" class="inventory-stats">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409EFF"><el-icon><Box /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ inventoryStats.totalSku.toLocaleString() }}</div>
              <div class="stat-label">SKU总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A"><el-icon><Goods /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ inventoryStats.totalStock.toLocaleString() }}</div>
              <div class="stat-label">库存总量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C"><el-icon><Lock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ inventoryStats.frozenStock.toLocaleString() }}</div>
              <div class="stat-label">冻结库存</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ inventoryStats.warningCount }}</div>
              <div class="stat-label">预警SKU</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #9b59b6"><el-icon><OfficeBuilding /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ inventoryStats.warehouseCount }}</div>
              <div class="stat-label">仓库数量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea"><el-icon><Money /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(inventoryStats.stockValue) }}</div>
              <div class="stat-label">库存金额</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="SKU编码">
          <el-input v-model="queryParams.skuCode" placeholder="SKU编码" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.productName" placeholder="商品名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="queryParams.warehouseId" placeholder="全部仓库" clearable style="width: 150px">
            <el-option label="总部仓库" value="hq" />
            <el-option label="北京仓" value="bj" />
            <el-option label="上海仓" value="sh" />
            <el-option label="广州仓" value="gz" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="库存预警" value="warning" />
            <el-option label="缺货" value="out" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 库存列表 -->
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="skuCode" label="SKU编码" width="130" />
        <el-table-column label="商品信息" min-width="220">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.image" class="product-image" fit="cover" />
              <div class="product-info">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-sku">{{ row.skuName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.warehouseName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存数量" width="120" align="center">
          <template #default="{ row }">
            <div class="stock-cell">
              <div class="stock-item">
                <span class="stock-label">可用</span>
                <span class="stock-value available">{{ row.availableStock }}</span>
              </div>
              <div class="stock-item">
                <span class="stock-label">冻结</span>
                <span class="stock-value frozen">{{ row.frozenStock }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="80" align="center">
          <template #default="{ row }">
            <span :class="['total-stock', getStockClass(row)]">{{ row.totalStock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="成本价" width="80" align="right">
          <template #default="{ row }">¥{{ row.costPrice }}</template>
        </el-table-column>
        <el-table-column label="库存金额" width="100" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatMoney(row.stockAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预警阈值" width="80" align="center">
          <template #default="{ row }">{{ row.warningThreshold }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)" size="small">{{ getStatusLabel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleAdjust(row)">调整</el-button>
            <el-button link type="primary" @click="handleLog(row)">流水</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Download, Box, Goods, Lock, Warning, OfficeBuilding, Money, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const total = ref(0)

const queryParams = reactive({
  skuCode: '',
  productName: '',
  warehouseId: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const inventoryStats = ref({
  totalSku: 8956,
  totalStock: 234567,
  frozenStock: 12345,
  warningCount: 156,
  warehouseCount: 128,
  stockValue: 12345678
})

const tableData = ref([
  { id: 1, skuCode: 'SKU001', productName: '经典款T恤男女同款', skuName: '白色/L', image: 'https://picsum.photos/50/50?random=1301', warehouseName: '总部仓', availableStock: 156, frozenStock: 12, totalStock: 168, costPrice: 45, stockAmount: 7560, warningThreshold: 50 },
  { id: 2, skuCode: 'SKU002', productName: '纯棉休闲裤男', skuName: '黑色/32', image: 'https://picsum.photos/50/50?random=1302', warehouseName: '北京仓', availableStock: 23, frozenStock: 5, totalStock: 28, costPrice: 89, stockAmount: 2492, warningThreshold: 30 },
  { id: 3, skuCode: 'SKU003', productName: '女士碎花连衣裙', skuName: '粉色/S', image: 'https://picsum.photos/50/50?random=1303', warehouseName: '上海仓', availableStock: 89, frozenStock: 0, totalStock: 89, costPrice: 129, stockAmount: 11481, warningThreshold: 20 },
  { id: 4, skuCode: 'SKU004', productName: '运动鞋男款透气', skuName: '白色/42', image: 'https://picsum.photos/50/50?random=1304', warehouseName: '广州仓', availableStock: 5, frozenStock: 3, totalStock: 8, costPrice: 189, stockAmount: 1512, warningThreshold: 20 },
  { id: 5, skuCode: 'SKU005', productName: '男士商务衬衫', skuName: '白色/41', image: 'https://picsum.photos/50/50?random=1305', warehouseName: '总部仓', availableStock: 234, frozenStock: 45, totalStock: 279, costPrice: 79, stockAmount: 22041, warningThreshold: 40 },
  { id: 6, skuCode: 'SKU006', productName: '女士针织开衫', skuName: '灰色/M', image: 'https://picsum.photos/50/50?random=1306', warehouseName: '北京仓', availableStock: 67, frozenStock: 8, totalStock: 75, costPrice: 99, stockAmount: 7425, warningThreshold: 30 },
  { id: 7, skuCode: 'SKU007', productName: '儿童纯棉T恤', skuName: '黄色/L', image: 'https://picsum.photos/50/50?random=1307', warehouseName: '上海仓', availableStock: 0, frozenStock: 0, totalStock: 0, costPrice: 35, stockAmount: 0, warningThreshold: 20 },
  { id: 8, skuCode: 'SKU008', productName: '时尚帆布背包', skuName: '黑色', image: 'https://picsum.photos/50/50?random=1308', warehouseName: '广州仓', availableStock: 45, frozenStock: 2, totalStock: 47, costPrice: 56, stockAmount: 2632, warningThreshold: 15 }
])

onMounted(() => {
  total.value = tableData.value.length
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getStockClass = (row: any) => {
  if (row.totalStock === 0) return 'out'
  if (row.totalStock <= row.warningThreshold) return 'warning'
  return 'normal'
}

const getStatusType = (row: any) => {
  if (row.totalStock === 0) return 'danger'
  if (row.totalStock <= row.warningThreshold) return 'warning'
  return 'success'
}

const getStatusLabel = (row: any) => {
  if (row.totalStock === 0) return '缺货'
  if (row.totalStock <= row.warningThreshold) return '预警'
  return '正常'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.skuCode = ''
  queryParams.productName = ''
  queryParams.warehouseId = ''
  queryParams.status = ''
}

const handleExport = () => {
  ElMessage.success('正在导出库存数据...')
}

const handleDetail = (row: any) => {
  ElMessage.info('查看库存详情: ' + row.skuCode)
}

const handleAdjust = (row: any) => {
  ElMessage.info('调整库存: ' + row.skuCode)
}

const handleLog = (row: any) => {
  ElMessage.info('查看库存流水: ' + row.skuCode)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inventory-stats {
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
  font-size: 18px;
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
  gap: 10px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.product-name {
  font-size: 13px;
  color: #303133;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.stock-label {
  color: #909399;
}

.stock-value.available { color: #67C23A; }
.stock-value.frozen { color: #E6A23C; }

.total-stock.normal { color: #67C23A; font-weight: bold; }
.total-stock.warning { color: #E6A23C; font-weight: bold; }
.total-stock.out { color: #F56C6C; font-weight: bold; }

.amount {
  color: #303133;
  font-weight: 500;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>