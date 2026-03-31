<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.keyword" placeholder="商品名称/编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
            v-model="queryParams.categoryId"
            :options="categories"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="选择分类"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="queryParams.brandId" placeholder="选择品牌" clearable style="width: 150px">
            <el-option v-for="brand in brands" :key="brand" :label="brand" :value="brand" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="商品状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="已上架" :value="1" />
            <el-option label="已下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作 -->
      <div class="batch-actions">
        <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        <el-button size="small" :disabled="!selectedItems.length" @click="handleBatchOnline">批量上架</el-button>
        <el-button size="small" :disabled="!selectedItems.length" @click="handleBatchOffline">批量下架</el-button>
        <el-button size="small" type="danger" :disabled="!selectedItems.length" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="productCode" label="商品编码" width="120" fixed />
        <el-table-column label="商品信息" min-width="280">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image
                :src="row.mainImage"
                class="product-image"
                fit="cover"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-info">
                <div class="product-name">
                  <el-tag v-if="row.isHot" type="danger" size="small" effect="dark">热销</el-tag>
                  <el-tag v-if="row.isNew" type="success" size="small" effect="dark">新品</el-tag>
                  {{ row.productName }}
                </div>
                <div class="product-meta">
                  <span>分类: {{ row.categoryName }}</span>
                  <span>品牌: {{ row.brandName }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="right">
          <template #default="{ row }">
            <div class="price-cell">
              <div class="sale-price">¥{{ row.salePrice }}</div>
              <div class="market-price">¥{{ row.marketPrice }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock < 50 ? 'danger' : row.stock < 100 ? 'warning' : 'success'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleSku(row)">SKU</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadTableData"
        @current-change="loadTableData"
        class="pagination"
      />
    </el-card>

    <!-- 商品详情抽屉 -->
    <el-drawer v-model="detailVisible" title="商品详情" size="600px">
      <el-descriptions :column="2" border v-if="currentProduct">
        <el-descriptions-item label="商品编码">{{ currentProduct.productCode }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentProduct.productName }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentProduct.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ currentProduct.brandName }}</el-descriptions-item>
        <el-descriptions-item label="售价">¥{{ currentProduct.salePrice }}</el-descriptions-item>
        <el-descriptions-item label="市场价">¥{{ currentProduct.marketPrice }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ currentProduct.stock }}</el-descriptions-item>
        <el-descriptions-item label="销量">{{ currentProduct.sales }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentProduct.status ? 'success' : 'info'">
            {{ currentProduct.status ? '已上架' : '已下架' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentProduct.createTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>SKU列表</el-divider>
      <el-table :data="currentProduct?.skus || []" border size="small">
        <el-table-column prop="skuCode" label="SKU编码" width="100" />
        <el-table-column prop="skuName" label="规格" />
        <el-table-column label="价格" width="80">
          <template #default="{ row }">¥{{ row.salePrice }}</template>
        </el-table-column>
        <el-table-column label="库存" width="80">
          <template #default="{ row }">{{ row.stock }}</template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Download, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Mock from '@/mock'

const loading = ref(false)
const total = ref(0)
const tableData = ref<any[]>([])
const selectedItems = ref<any[]>([])
const selectAll = ref(false)
const detailVisible = ref(false)
const currentProduct = ref<any>(null)

const queryParams = reactive({
  keyword: '',
  categoryId: '',
  brandId: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const categories = ref(Mock.getCategories())
const brands = ref(['NIKE', 'ADIDAS', 'UNIQLO', 'ZARA', 'H&M', 'GXG', '太平鸟'])

onMounted(() => {
  loadTableData()
})

const loadTableData = () => {
  loading.value = true
  setTimeout(() => {
    const result = Mock.getProducts(queryParams)
    tableData.value = result.list
    total.value = result.total
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  queryParams.pageNum = 1
  loadTableData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.categoryId = ''
  queryParams.brandId = ''
  queryParams.status = ''
  handleSearch()
}

const handleExport = () => {
  ElMessage.success('正在导出商品数据...')
}

const handleSelectAll = (val: boolean) => {
  if (val) {
    selectedItems.value = tableData.value
  } else {
    selectedItems.value = []
  }
}

const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items
  selectAll.value = items.length === tableData.value.length
}

const handleBatchOnline = () => {
  ElMessage.success(`已上架 ${selectedItems.value.length} 个商品`)
}

const handleBatchOffline = () => {
  ElMessage.success(`已下架 ${selectedItems.value.length} 个商品`)
}

const handleBatchDelete = () => {
  ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success(`已删除 ${selectedItems.value.length} 个商品`)
      loadTableData()
    })
}

const handleAdd = () => {
  ElMessage.info('打开新增商品表单')
}

const handleView = (row: any) => {
  currentProduct.value = Mock.getProductDetail(row.id)
  detailVisible.value = true
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑商品: ' + row.productName)
}

const handleSku = (row: any) => {
  ElMessage.info('管理SKU: ' + row.productName)
}

const handleStatusChange = (row: any) => {
  ElMessage.success(row.status ? '商品已上架' : '商品已下架')
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('删除成功')
      loadTableData()
    })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 16px;
}

.batch-actions {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
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
  flex-shrink: 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.product-info {
  flex: 1;
  min-width: 0;
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
  margin-top: 4px;
  display: flex;
  gap: 12px;
}

.price-cell {
  text-align: right;
}

.sale-price {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
}

.market-price {
  font-size: 12px;
  color: #C0C4CC;
  text-decoration: line-through;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>