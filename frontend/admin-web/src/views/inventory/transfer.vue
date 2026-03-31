<template>
  <div class="inventory-transfer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存调拨管理</span>
          <el-button type="primary" @click="handleCreateTransfer">创建调拨单</el-button>
        </div>
      </template>

      <!-- 调拨统计 -->
      <el-row :gutter="16" class="transfer-stats">
        <el-col :span="6">
          <div class="stat-card pending">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-value">{{ transferStats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card processing">
            <div class="stat-icon">🚚</div>
            <div class="stat-content">
              <div class="stat-value">{{ transferStats.processing }}</div>
              <div class="stat-label">调拨中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card completed">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ transferStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-value">{{ transferStats.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="调拨单号">
          <el-input v-model="queryParams.transferNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待审核" value="pending" />
            <el-option label="调拨中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="调出门店">
          <el-select v-model="queryParams.fromStore" placeholder="全部门店" clearable style="width: 150px">
            <el-option label="总部仓库" value="hq" />
            <el-option label="北京朝阳店" value="bj" />
            <el-option label="上海静安店" value="sh" />
          </el-select>
        </el-form-item>
        <el-form-item label="调入门店">
          <el-select v-model="queryParams.toStore" placeholder="全部门店" clearable style="width: 150px">
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

      <!-- 调拨列表 -->
      <el-table :data="transferList" v-loading="loading" border>
        <el-table-column prop="transferNo" label="调拨单号" width="150" />
        <el-table-column label="调出门店" width="130">
          <template #default="{ row }">
            <el-tag type="info">{{ row.fromStore }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="调入门店" width="130">
          <template #default="{ row }">
            <el-tag type="success">{{ row.toStore }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" width="100" align="center">
          <template #default="{ row }">
            <span class="quantity">{{ row.itemCount }}种/{{ row.totalQuantity }}件</span>
          </template>
        </el-table-column>
        <el-table-column label="调拨原因" min-width="150">
          <template #default="{ row }">
            <div class="reason-cell">
              <span>{{ row.reason }}</span>
              <span class="reason-detail">{{ row.reasonDetail }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="success" v-if="row.status === 'pending'" @click="handleApprove(row)">审核</el-button>
            <el-button link type="warning" v-if="row.status === 'processing'" @click="handleReceive(row)">确认收货</el-button>
            <el-button link type="danger" v-if="row.status === 'pending'" @click="handleReject(row)">拒绝</el-button>
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

    <!-- 调拨详情抽屉 -->
    <el-drawer v-model="detailVisible" title="调拨单详情" size="600px">
      <template v-if="currentTransfer">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="调拨单号">{{ currentTransfer.transferNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTransfer.status)">{{ getStatusLabel(currentTransfer.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="调出门店">{{ currentTransfer.fromStore }}</el-descriptions-item>
          <el-descriptions-item label="调入门店">{{ currentTransfer.toStore }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentTransfer.createTime }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentTransfer.creator }}</el-descriptions-item>
          <el-descriptions-item label="调拨原因" :span="2">{{ currentTransfer.reason }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>调拨商品</el-divider>

        <el-table :data="currentTransfer.items" border size="small">
          <el-table-column label="商品信息" min-width="200">
            <template #default="{ row }">
              <div class="product-cell">
                <el-image :src="row.image" class="product-image" fit="cover" />
                <div>
                  <div>{{ row.name }}</div>
                  <div class="sku-text">SKU: {{ row.sku }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="调拨数量" width="100" align="center" />
          <el-table-column label="调出库存" width="100" align="center">
            <template #default="{ row }">{{ row.fromStock }}件</template>
          </el-table-column>
          <el-table-column label="调入库存" width="100" align="center">
            <template #default="{ row }">{{ row.toStock }}件</template>
          </el-table-column>
        </el-table>

        <el-divider>审核记录</el-divider>

        <el-timeline>
          <el-timeline-item v-for="(log, index) in currentTransfer.logs" :key="index" :timestamp="log.time" placement="top">
            <div class="log-content">
              <span class="log-action">{{ log.action }}</span>
              <span class="log-user">by {{ log.user }}</span>
              <div v-if="log.remark" class="log-remark">{{ log.remark }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const detailVisible = ref(false)
const currentTransfer = ref<any>(null)

const queryParams = reactive({
  transferNo: '',
  status: '',
  fromStore: '',
  toStore: '',
  pageNum: 1,
  pageSize: 10
})

const transferStats = ref({
  pending: 12,
  processing: 8,
  completed: 156,
  rejected: 3
})

const transferList = ref([
  { id: 1, transferNo: 'TF20260301001', fromStore: '总部仓库', toStore: '北京朝阳店', itemCount: 5, totalQuantity: 120, reason: '门店补货', reasonDetail: '北京朝阳店库存不足，需要紧急补货', status: 'pending', createTime: '2026-03-30 10:30:00', creator: '张三' },
  { id: 2, transferNo: 'TF20260301002', fromStore: '上海静安店', toStore: '总部仓库', itemCount: 3, totalQuantity: 50, reason: '滞销退货', reasonDetail: '该商品在上海区域销售不佳，调回总部统一处理', status: 'processing', createTime: '2026-03-29 14:20:00', creator: '李四' },
  { id: 3, transferNo: 'TF20260301003', fromStore: '北京朝阳店', toStore: '上海静安店', itemCount: 2, totalQuantity: 30, reason: '区域调配', reasonDetail: '上海区域该商品需求量大，进行区域间调配', status: 'completed', createTime: '2026-03-28 09:15:00', creator: '王五' },
  { id: 4, transferNo: 'TF20260301004', fromStore: '总部仓库', toStore: '广州天河店', itemCount: 8, totalQuantity: 200, reason: '新店开业', reasonDetail: '广州天河店即将开业，需要首批铺货', status: 'pending', createTime: '2026-03-30 11:45:00', creator: '赵六' },
  { id: 5, transferNo: 'TF20260301005', fromStore: '深圳福田店', toStore: '总部仓库', itemCount: 4, totalQuantity: 80, reason: '季节调整', reasonDetail: '冬季商品换季清仓，调回总部仓库', status: 'completed', createTime: '2026-03-25 16:30:00', creator: '孙七' }
])

onMounted(() => {
  total.value = transferList.value.length
})

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待审核',
    processing: '调拨中',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return labels[status] || '未知'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.transferNo = ''
  queryParams.status = ''
  queryParams.fromStore = ''
  queryParams.toStore = ''
}

const handleCreateTransfer = () => {
  ElMessage.info('打开创建调拨单表单')
}

const handleDetail = (row: any) => {
  currentTransfer.value = {
    ...row,
    items: [
      { name: '男士纯棉短袖T恤', sku: 'T001-BL-M', image: 'https://picsum.photos/60/60?random=201', quantity: 50, fromStock: 200, toStock: 15 },
      { name: '女士碎花连衣裙', sku: 'D001-PK-S', image: 'https://picsum.photos/60/60?random=202', quantity: 30, fromStock: 150, toStock: 8 },
      { name: '儿童卡通T恤', sku: 'K001-YG-L', image: 'https://picsum.photos/60/60?random=203', quantity: 20, fromStock: 80, toStock: 12 },
      { name: '运动透气跑鞋', sku: 'S001-WH-42', image: 'https://picsum.photos/60/60?random=204', quantity: 10, fromStock: 60, toStock: 5 },
      { name: '时尚帆布背包', sku: 'B001-BK', image: 'https://picsum.photos/60/60?random=205', quantity: 10, fromStock: 40, toStock: 3 }
    ],
    logs: [
      { action: '创建调拨单', user: '张三', time: '2026-03-30 10:30:00', remark: '' },
      { action: '提交审核', user: '张三', time: '2026-03-30 10:35:00', remark: '' }
    ]
  }
  detailVisible.value = true
}

const handleApprove = (row: any) => {
  ElMessageBox.confirm('确认通过该调拨单吗？', '审核确认', { type: 'success' })
    .then(() => {
      ElMessage.success('调拨单已审核通过')
    })
}

const handleReceive = (row: any) => {
  ElMessageBox.confirm('确认已收到调拨商品吗？', '收货确认', { type: 'success' })
    .then(() => {
      ElMessage.success('已确认收货，库存已更新')
    })
}

const handleReject = (row: any) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝调拨', {
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '请输入拒绝原因'
  }).then(({ value }) => {
    ElMessage.success('已拒绝调拨单: ' + value)
  })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transfer-stats {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #ebeef5;
}

.stat-card.pending { border-top: 3px solid #E6A23C; }
.stat-card.processing { border-top: 3px solid #409EFF; }
.stat-card.completed { border-top: 3px solid #67C23A; }
.stat-card.rejected { border-top: 3px solid #F56C6C; }

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.search-form {
  margin-bottom: 16px;
}

.quantity {
  color: #409EFF;
}

.reason-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reason-detail {
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
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

.sku-text {
  font-size: 12px;
  color: #909399;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-action {
  font-weight: 500;
  color: #303133;
}

.log-user {
  font-size: 12px;
  color: #909399;
}

.log-remark {
  font-size: 13px;
  color: #606266;
}
</style>