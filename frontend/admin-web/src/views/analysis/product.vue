<template>
  <div class="product-analysis">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品分析</span>
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
            <div class="stat-icon" style="background: #409EFF"><el-icon><Box /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalProducts.toLocaleString() }}</div>
              <div class="stat-label">在售商品</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activeProducts.toLocaleString() }}</div>
              <div class="stat-label">动销商品</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C"><el-icon><ShoppingCart /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalSales.toLocaleString() }}</div>
              <div class="stat-label">总销量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C"><el-icon><Money /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(stats.totalAmount) }}</div>
              <div class="stat-label">销售总额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #9b59b6"><el-icon><PriceTag /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.avgPrice }}</div>
              <div class="stat-label">平均单价</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea"><el-icon><DataAnalysis /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.sellRate }}%</div>
              <div class="stat-label">动销率</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 分类销售分析 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>分类销售排行</span>
            </template>
            <div class="category-chart">
              <div v-for="(item, index) in categoryData" :key="index" class="category-item">
                <div class="category-info">
                  <span class="category-name">{{ item.name }}</span>
                  <span class="category-value">¥{{ formatMoney(item.amount) }}</span>
                </div>
                <el-progress :percentage="item.percentage" :stroke-width="12" :color="item.color" />
                <div class="category-meta">
                  <span>销量: {{ item.sales.toLocaleString() }}</span>
                  <span>SKU: {{ item.skuCount }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>品牌销售排行</span>
            </template>
            <el-table :data="brandData" size="small" border>
              <el-table-column width="50">
                <template #default="{ $index }">
                  <span :class="['rank', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="品牌" />
              <el-table-column label="销售额" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column label="销量" align="center">
                <template #default="{ row }">{{ row.sales.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column label="占比" width="100">
                <template #default="{ row }">
                  <el-progress :percentage="row.percentage" :stroke-width="6" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- 商品排行榜 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>🔥 热销商品 TOP10</span>
                <el-button link type="primary">查看更多</el-button>
              </div>
            </template>
            <el-table :data="hotProducts" size="small">
              <el-table-column width="50">
                <template #default="{ $index }">
                  <span :class="['rank', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="商品" min-width="180">
                <template #default="{ row }">
                  <div class="product-cell">
                    <el-image :src="row.image" class="product-image" />
                    <div>
                      <div class="product-name">{{ row.name }}</div>
                      <div class="product-sku">{{ row.sku }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="销量" align="center">
                <template #default="{ row }">{{ row.sales.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column label="销售额" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>⚠️ 滞销商品</span>
                <el-button link type="primary">查看更多</el-button>
              </div>
            </template>
            <el-table :data="slowProducts" size="small">
              <el-table-column label="商品" min-width="180">
                <template #default="{ row }">
                  <div class="product-cell">
                    <el-image :src="row.image" class="product-image" />
                    <div>
                      <div class="product-name">{{ row.name }}</div>
                      <div class="product-sku">库存: {{ row.stock }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="30天销量" align="center">
                <template #default="{ row }">{{ row.sales }}</template>
              </el-table-column>
              <el-table-column label="周转天数" align="center">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.turnover }}天</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="建议" width="80">
                <template #default="{ row }">
                  <el-tag type="warning" size="small">{{ row.suggest }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- 价格区间分析 -->
      <el-card style="margin-top: 20px">
        <template #header>
          <span>价格区间分析</span>
        </template>
        <div class="price-range">
          <div v-for="(item, index) in priceRangeData" :key="index" class="price-item">
            <div class="price-range-label">{{ item.range }}</div>
            <div class="price-info">
              <div class="price-sales">
                <span>销量: {{ item.sales.toLocaleString() }}</span>
                <span>销售额: ¥{{ formatMoney(item.amount) }}</span>
              </div>
              <el-progress :percentage="item.percentage" :stroke-width="10" />
            </div>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Box, TrendCharts, ShoppingCart, Money, PriceTag, DataAnalysis } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const dateRange = ref([])

const stats = ref({
  totalProducts: 12345,
  activeProducts: 8956,
  totalSales: 234567,
  totalAmount: 12345678,
  avgPrice: 156,
  sellRate: 72.5
})

const categoryData = ref([
  { name: '女装', amount: 4567890, sales: 56789, skuCount: 2345, percentage: 37, color: '#F56C6C' },
  { name: '男装', amount: 3456789, sales: 45678, skuCount: 1890, percentage: 28, color: '#409EFF' },
  { name: '童装', amount: 2345678, sales: 34567, skuCount: 1234, percentage: 19, color: '#67C23A' },
  { name: '配饰', amount: 1234567, sales: 23456, skuCount: 890, percentage: 10, color: '#E6A23C' },
  { name: '鞋履', amount: 745654, sales: 12345, skuCount: 567, percentage: 6, color: '#9b59b6' }
])

const brandData = ref([
  { name: 'UNIQLO', amount: 2345678, sales: 34567, percentage: 19 },
  { name: 'ZARA', amount: 1987654, sales: 28901, percentage: 16 },
  { name: 'H&M', amount: 1789012, sales: 25678, percentage: 14 },
  { name: 'NIKE', amount: 1567890, sales: 23456, percentage: 13 },
  { name: 'ADIDAS', amount: 1345678, sales: 20123, percentage: 11 }
])

const hotProducts = ref([
  { name: '经典款T恤男女同款', sku: 'T001-BL-M', image: 'https://picsum.photos/40/40?random=1001', sales: 5678, amount: 345678 },
  { name: '纯棉休闲裤男', sku: 'P001-KH-32', image: 'https://picsum.photos/40/40?random=1002', sales: 4567, amount: 456789 },
  { name: '女士碎花连衣裙', sku: 'D001-PK-S', image: 'https://picsum.photos/40/40?random=1003', sales: 3890, amount: 567890 },
  { name: '运动鞋男款透气', sku: 'S001-WH-42', image: 'https://picsum.photos/40/40?random=1004', sales: 3456, amount: 678901 },
  { name: '男士商务衬衫', sku: 'S002-WH-41', image: 'https://picsum.photos/40/40?random=1005', sales: 3012, amount: 234567 },
  { name: '女士针织开衫', sku: 'C001-GY-M', image: 'https://picsum.photos/40/40?random=1006', sales: 2789, amount: 345678 },
  { name: '儿童纯棉T恤', sku: 'K001-YG-L', image: 'https://picsum.photos/40/40?random=1007', sales: 2567, amount: 178901 },
  { name: '时尚帆布背包', sku: 'B001-BK', image: 'https://picsum.photos/40/40?random=1008', sales: 2345, amount: 156789 },
  { name: '运动休闲裤', sku: 'P002-BK-30', image: 'https://picsum.photos/40/40?random=1009', sales: 2100, amount: 289012 },
  { name: '纯棉四件套', sku: 'BD001-WH', image: 'https://picsum.photos/40/40?random=1010', sales: 1890, amount: 456789 }
])

const slowProducts = ref([
  { name: '冬季羽绒服', image: 'https://picsum.photos/40/40?random=1011', stock: 234, sales: 5, turnover: 156, suggest: '清仓' },
  { name: '厚款棉服', image: 'https://picsum.photos/40/40?random=1012', stock: 189, sales: 8, turnover: 120, suggest: '降价' },
  { name: '羊毛围巾', image: 'https://picsum.photos/40/40?random=1013', stock: 156, sales: 12, turnover: 89, suggest: '促销' },
  { name: '皮手套', image: 'https://picsum.photos/40/40?random=1014', stock: 98, sales: 15, turnover: 67, suggest: '观察' },
  { name: '毛线帽', image: 'https://picsum.photos/40/40?random=1015', stock: 67, sales: 18, turnover: 45, suggest: '观察' }
])

const priceRangeData = ref([
  { range: '0-100元', sales: 89567, amount: 4567890, percentage: 37 },
  { range: '100-200元', sales: 56789, amount: 5678901, percentage: 46 },
  { range: '200-500元', sales: 23456, amount: 3456789, percentage: 28 },
  { range: '500-1000元', sales: 8901, amount: 2345678, percentage: 19 },
  { range: '1000元以上', sales: 2345, amount: 1234567, percentage: 10 }
])

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const handleExport = () => {
  ElMessage.success('正在导出商品分析报表...')
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

.category-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-info {
  display: flex;
  justify-content: space-between;
}

.category-name {
  font-size: 14px;
  color: #303133;
}

.category-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
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

.product-name {
  font-size: 13px;
  color: #303133;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.price-range-label {
  width: 100px;
  font-size: 14px;
  color: #303133;
}

.price-info {
  flex: 1;
}

.price-sales {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}
</style>