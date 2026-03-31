<template>
  <div class="order-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出订单
          </el-button>
        </div>
      </template>

      <!-- 订单统计卡片 -->
      <el-row :gutter="16" class="order-stats">
        <el-col :span="4">
          <div class="stat-item" @click="filterByStatus('')">
            <div class="stat-value">{{ orderStats.total }}</div>
            <div class="stat-label">全部订单</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item pending" @click="filterByStatus(0)">
            <div class="stat-value">{{ orderStats.pending }}</div>
            <div class="stat-label">待支付</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item paid" @click="filterByStatus(2)">
            <div class="stat-value">{{ orderStats.toShip }}</div>
            <div class="stat-label">待发货</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item shipped" @click="filterByStatus(3)">
            <div class="stat-value">{{ orderStats.shipped }}</div>
            <div class="stat-label">已发货</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item completed" @click="filterByStatus(4)">
            <div class="stat-value">{{ orderStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item refund" @click="filterByStatus(6)">
            <div class="stat-value">{{ orderStats.refund }}</div>
            <div class="stat-label">已退款</div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会员">
          <el-input v-model="queryParams.memberInfo" placeholder="会员名称/手机号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="orderNo" label="订单号" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">{{ row.orderNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="会员信息" width="150">
          <template #default="{ row }">
            <div>{{ row.memberName }}</div>
            <div class="sub-text">{{ row.memberPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" width="80" align="center">
          <template #default="{ row }">
            <el-tag>{{ row.totalQuantity }}件</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <span class="total">¥{{ row.totalAmount }}</span>
              <span class="discount">-¥{{ row.discountAmount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实付金额" width="100" align="right">
          <template #default="{ row }">
            <span class="pay-amount">¥{{ row.payAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单来源" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收货信息" min-width="180">
          <template #default="{ row }">
            <div>{{ row.receiverName }} {{ row.receiverPhone }}</div>
            <div class="sub-text">{{ row.receiverAddress }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" v-if="row.status === 2" @click="handleShip(row)">发货</el-button>
            <el-button link type="warning" v-if="row.status === 0" @click="handleCancel(row)">取消</el-button>
            <el-button link type="primary" v-if="row.status >= 1 && row.status <= 3" @click="handleRefund(row)">退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
      />
    </el-card>

    <!-- 订单详情抽屉 -->
    <el-drawer v-model="detailVisible" title="订单详情" size="700px">
      <template v-if="currentOrder">
        <!-- 订单状态流程 -->
        <div class="order-progress">
          <el-steps :active="getActiveStep(currentOrder.status)" finish-status="success">
            <el-step title="提交订单" :description="currentOrder.createTime" />
            <el-step title="支付成功" :description="currentOrder.payTime || '-'" />
            <el-step title="商品发货" :description="currentOrder.deliveryTime || '-'" />
            <el-step title="交易完成" :description="currentOrder.finishTime || '-'" />
          </el-steps>
        </div>

        <el-divider />

        <!-- 订单信息 -->
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ currentOrder.payTypeName }}</el-descriptions-item>
          <el-descriptions-item label="订单来源">{{ currentOrder.source }}</el-descriptions-item>
        </el-descriptions>

        <!-- 会员信息 -->
        <el-descriptions title="会员信息" :column="2" border style="margin-top: 16px">
          <el-descriptions-item label="会员账号">{{ currentOrder.memberPhone }}</el-descriptions-item>
          <el-descriptions-item label="会员等级">{{ currentOrder.memberLevel }}</el-descriptions-item>
        </el-descriptions>

        <!-- 收货信息 -->
        <el-descriptions title="收货信息" :column="1" border style="margin-top: 16px">
          <el-descriptions-item label="收货人">{{ currentOrder.receiverName }} {{ currentOrder.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.receiverAddress }}</el-descriptions-item>
          <el-descriptions-item label="买家备注">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 物流信息 -->
        <div v-if="currentOrder.logistics" style="margin-top: 16px">
          <el-divider>物流信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流公司">{{ currentOrder.logistics.company }}</el-descriptions-item>
            <el-descriptions-item label="物流单号">{{ currentOrder.logistics.trackingNo }}</el-descriptions-item>
          </el-descriptions>
          <el-timeline style="margin-top: 16px">
            <el-timeline-item
              v-for="(trace, index) in currentOrder.logistics.traces"
              :key="index"
              :timestamp="trace.time"
              placement="top"
            >
              {{ trace.desc }}
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 商品明细 -->
        <el-divider>商品明细</el-divider>
        <el-table :data="currentOrder.items" border>
          <el-table-column label="商品信息" min-width="250">
            <template #default="{ row }">
              <div class="product-cell">
                <el-image :src="row.productImage" class="product-image" fit="cover" />
                <div>
                  <div>{{ row.productName }}</div>
                  <div class="sub-text">{{ row.skuName }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="80">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="60" align="center" />
          <el-table-column label="小计" width="100" align="right">
            <template #default="{ row }">
              <span class="pay-amount">¥{{ row.amount }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 费用明细 -->
        <div class="amount-summary">
          <div class="amount-row">
            <span>商品总额：</span>
            <span>¥{{ currentOrder.totalAmount }}</span>
          </div>
          <div class="amount-row">
            <span>优惠金额：</span>
            <span class="discount">-¥{{ currentOrder.discountAmount }}</span>
          </div>
          <div class="amount-row">
            <span>运费：</span>
            <span>¥{{ currentOrder.freightAmount }}</span>
          </div>
          <div class="amount-row total">
            <span>实付金额：</span>
            <span>¥{{ currentOrder.payAmount }}</span>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Download, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Mock from '@/mock'

const loading = ref(false)
const total = ref(0)
const tableData = ref<any[]>([])
const detailVisible = ref(false)
const currentOrder = ref<any>(null)

const queryParams = reactive({
  orderNo: '',
  memberInfo: '',
  status: '',
  dateRange: [],
  pageNum: 1,
  pageSize: 10
})

const orderStats = ref({
  total: 12567,
  pending: 234,
  toShip: 156,
  shipped: 89,
  completed: 11890,
  refund: 198
})

const statusMap: Record<number, { text: string; type: string }> = {
  0: { text: '待支付', type: 'warning' },
  1: { text: '已支付', type: 'primary' },
  2: { text: '待发货', type: 'primary' },
  3: { text: '已发货', type: 'info' },
  4: { text: '已完成', type: 'success' },
  5: { text: '已取消', type: 'info' },
  6: { text: '已退款', type: 'danger' }
}

onMounted(() => {
  loadTableData()
})

const loadTableData = () => {
  loading.value = true
  setTimeout(() => {
    const result = Mock.getOrders(queryParams)
    tableData.value = result.list
    total.value = result.total
    loading.value = false
  }, 500)
}

const getStatusType = (status: number) => statusMap[status]?.type || 'info'
const getActiveStep = (status: number) => {
  if (status === 0) return 0
  if (status === 1) return 1
  if (status === 2) return 1
  if (status === 3) return 2
  if (status >= 4) return 3
  return 0
}

const filterByStatus = (status: number | string) => {
  queryParams.status = status
  queryParams.pageNum = 1
  loadTableData()
}

const handleSearch = () => {
  queryParams.pageNum = 1
  loadTableData()
}

const handleReset = () => {
  queryParams.orderNo = ''
  queryParams.memberInfo = ''
  queryParams.status = ''
  queryParams.dateRange = []
  handleSearch()
}

const handleExport = () => {
  ElMessage.success('正在导出订单数据...')
}

const handleDetail = (row: any) => {
  currentOrder.value = Mock.getOrderDetail(row.orderNo)
  detailVisible.value = true
}

const handleShip = (row: any) => {
  ElMessageBox.prompt('请输入物流单号', '发货确认', {
    confirmButtonText: '确认发货',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '请输入物流单号'
  }).then(({ value }) => {
    ElMessage.success('发货成功，物流单号：' + value)
    loadTableData()
  })
}

const handleCancel = (row: any) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('订单已取消')
      loadTableData()
    })
}

const handleRefund = (row: any) => {
  ElMessageBox.confirm('确定要为该订单办理退款吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('退款申请已提交')
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

.order-stats {
  margin-bottom: 20px;
}

.stat-item {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e9ecf0;
}

.stat-item.pending { border-top: 3px solid #E6A23C; }
.stat-item.paid { border-top: 3px solid #409EFF; }
.stat-item.shipped { border-top: 3px solid #909399; }
.stat-item.completed { border-top: 3px solid #67C23A; }
.stat-item.refund { border-top: 3px solid #F56C6C; }

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.search-form {
  margin-bottom: 16px;
}

.sub-text {
  font-size: 12px;
  color: #909399;
}

.amount-cell {
  text-align: right;
}

.amount-cell .total {
  display: block;
}

.amount-cell .discount {
  font-size: 12px;
  color: #67C23A;
}

.pay-amount {
  font-weight: bold;
  color: #F56C6C;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.order-progress {
  padding: 20px 40px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background: #f5f7fa;
}

.amount-summary {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.amount-row.total {
  border-top: 1px solid #ddd;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 18px;
  font-weight: bold;
}

.amount-row.total span:last-child {
  color: #F56C6C;
}

.amount-row .discount {
  color: #67C23A;
}
</style>