<template>
  <div class="coupon-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>优惠券管理</span>
          <el-button type="primary" @click="handleCreateCoupon">创建优惠券</el-button>
        </div>
      </template>

      <!-- 优惠券统计 -->
      <el-row :gutter="16" class="coupon-stats">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon primary">
              <el-icon><Ticket /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ couponStats.total }}</div>
              <div class="stat-label">优惠券总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><Finished /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ couponStats.active }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ couponStats.pending }}</div>
              <div class="stat-label">待生效</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon info">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ couponStats.issued.toLocaleString() }}</div>
              <div class="stat-label">已发放</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon danger">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ couponStats.used.toLocaleString() }}</div>
              <div class="stat-label">已使用</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(couponStats.amount) }}</div>
              <div class="stat-label">优惠金额</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="券名称">
          <el-input v-model="queryParams.name" placeholder="优惠券名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 120px">
            <el-option label="满减券" value="discount" />
            <el-option label="折扣券" value="rate" />
            <el-option label="无门槛" value="none" />
            <el-option label="免运费" value="shipping" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待生效" value="pending" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 优惠券列表 -->
      <el-table :data="couponList" v-loading="loading" border>
        <el-table-column label="优惠券信息" min-width="220">
          <template #default="{ row }">
            <div class="coupon-cell">
              <div class="coupon-type-badge" :class="row.type">
                {{ row.typeLabel }}
              </div>
              <div class="coupon-info">
                <div class="coupon-name">{{ row.name }}</div>
                <div class="coupon-id">ID: {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="优惠内容" width="150">
          <template #default="{ row }">
            <div class="coupon-content">
              <span class="coupon-amount">{{ row.amount }}</span>
              <span class="coupon-condition">{{ row.condition }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发放/使用" width="120">
          <template #default="{ row }">
            <div class="usage-cell">
              <div>发放: {{ row.issued.toLocaleString() }}</div>
              <div>使用: {{ row.used.toLocaleString() }}</div>
              <el-progress :percentage="Math.round(row.used / row.issued * 100)" :stroke-width="6" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ row.startTime }}</div>
              <div>至 {{ row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="适用范围" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.scope }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="领取方式" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.receiveType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleIssue(row)">发放</el-button>
            <el-button link type="warning" v-if="row.status === 'active'" @click="handleDisable(row)">禁用</el-button>
            <el-button link type="success" v-if="row.status === 'disabled'" @click="handleEnable(row)">启用</el-button>
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

    <!-- 优惠券详情抽屉 -->
    <el-drawer v-model="detailVisible" title="优惠券详情" size="600px">
      <template v-if="currentCoupon">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="优惠券名称">{{ currentCoupon.name }}</el-descriptions-item>
          <el-descriptions-item label="优惠券ID">{{ currentCoupon.id }}</el-descriptions-item>
          <el-descriptions-item label="优惠类型">{{ currentCoupon.typeLabel }}</el-descriptions-item>
          <el-descriptions-item label="优惠金额">{{ currentCoupon.amount }}</el-descriptions-item>
          <el-descriptions-item label="使用条件">{{ currentCoupon.condition }}</el-descriptions-item>
          <el-descriptions-item label="适用范围">{{ currentCoupon.scope }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentCoupon.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentCoupon.endTime }}</el-descriptions-item>
          <el-descriptions-item label="每人限额">{{ currentCoupon.perLimit }}张</el-descriptions-item>
          <el-descriptions-item label="领取方式">{{ currentCoupon.receiveType }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>发放统计</el-divider>

        <el-row :gutter="16">
          <el-col :span="6">
            <div class="mini-stat">
              <div class="value">{{ currentCoupon.issued.toLocaleString() }}</div>
              <div class="label">发放总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="mini-stat">
              <div class="value">{{ currentCoupon.used.toLocaleString() }}</div>
              <div class="label">已使用</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="mini-stat">
              <div class="value">{{ currentCoupon.expired.toLocaleString() }}</div>
              <div class="label">已过期</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="mini-stat">
              <div class="value">¥{{ currentCoupon.usedAmount.toLocaleString() }}</div>
              <div class="label">优惠总额</div>
            </div>
          </el-col>
        </el-row>

        <el-divider>领取记录</el-divider>

        <el-table :data="currentCoupon.receiveLogs" size="small" border>
          <el-table-column label="会员" min-width="120">
            <template #default="{ row }">
              <div class="member-cell">
                <el-avatar :src="row.avatar" :size="24">{{ row.nickname.charAt(0) }}</el-avatar>
                <span>{{ row.nickname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="领取时间" width="160" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'used' ? 'success' : 'info'" size="small">
                {{ row.status === 'used' ? '已使用' : '未使用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="使用订单" width="150">
            <template #default="{ row }">{{ row.orderNo || '-' }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>

    <!-- 创建优惠券对话框 -->
    <el-dialog v-model="createVisible" title="创建优惠券" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="优惠券名称">
          <el-input v-model="createForm.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="优惠类型">
          <el-radio-group v-model="createForm.type">
            <el-radio label="discount">满减券</el-radio>
            <el-radio label="rate">折扣券</el-radio>
            <el-radio label="none">无门槛券</el-radio>
            <el-radio label="shipping">免运费券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠金额" v-if="createForm.type === 'discount' || createForm.type === 'none'">
          <el-input-number v-model="createForm.amount" :min="1" />
        </el-form-item>
        <el-form-item label="折扣比例" v-if="createForm.type === 'rate'">
          <el-slider v-model="createForm.rate" :min="50" :max="99" />
        </el-form-item>
        <el-form-item label="使用条件" v-if="createForm.type === 'discount'">
          <el-input-number v-model="createForm.minAmount" :min="0" />
          满<el-input-number v-model="createForm.minAmount" :min="0" style="width: 100px" />元可用
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker v-model="createForm.validRange" type="daterange" style="width: 100%" />
        </el-form-item>
        <el-form-item label="每人限额">
          <el-input-number v-model="createForm.perLimit" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="领取方式">
          <el-radio-group v-model="createForm.receiveType">
            <el-radio label="auto">自动发放</el-radio>
            <el-radio label="manual">手动领取</el-radio>
            <el-radio label="code">兑换码领取</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCoupon">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Ticket, Finished, Clock, Document, ShoppingCart, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const detailVisible = ref(false)
const createVisible = ref(false)
const currentCoupon = ref<any>(null)

const queryParams = reactive({
  name: '',
  type: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const createForm = reactive({
  name: '',
  type: 'discount',
  amount: 50,
  rate: 90,
  minAmount: 200,
  validRange: [],
  perLimit: 1,
  receiveType: 'manual'
})

const couponStats = ref({
  total: 45,
  active: 18,
  pending: 5,
  issued: 46000,
  used: 32456,
  amount: 456789
})

const couponList = ref([
  { id: 'C001', name: '新会员专享券', type: 'none', typeLabel: '无门槛', amount: '20元', condition: '无门槛', issued: 12000, used: 8500, startTime: '2026-03-01', endTime: '2026-06-30', scope: '全场通用', status: 'active', statusLabel: '进行中', receiveType: '自动发放' },
  { id: 'C002', name: '满200减50', type: 'discount', typeLabel: '满减', amount: '减50元', condition: '满200元', issued: 15000, used: 9800, startTime: '2026-03-15', endTime: '2026-04-15', scope: '全场通用', status: 'active', statusLabel: '进行中', receiveType: '手动领取' },
  { id: 'C003', name: '会员日折扣券', type: 'rate', typeLabel: '折扣', amount: '9折', condition: '无门槛', issued: 8000, used: 3200, startTime: '2026-03-20', endTime: '2026-03-25', scope: '服装专区', status: 'active', statusLabel: '进行中', receiveType: '手动领取' },
  { id: 'C004', name: '免运费券', type: 'shipping', typeLabel: '免运费', amount: '免运费', condition: '无门槛', issued: 5000, used: 4500, startTime: '2026-03-01', endTime: '2026-12-31', scope: '全场通用', status: 'active', statusLabel: '进行中', receiveType: '自动发放' },
  { id: 'C005', name: '新品体验券', type: 'none', typeLabel: '无门槛', amount: '30元', condition: '无门槛', issued: 3000, used: 1200, startTime: '2026-04-01', endTime: '2026-04-30', scope: '新品专区', status: 'pending', statusLabel: '待生效', receiveType: '兑换码' },
  { id: 'C006', name: '满500减100', type: 'discount', typeLabel: '满减', amount: '减100元', condition: '满500元', issued: 2000, used: 1800, startTime: '2026-02-01', endTime: '2026-02-28', scope: '全场通用', status: 'ended', statusLabel: '已结束', receiveType: '手动领取' },
  { id: 'C007', name: 'VIP专属券', type: 'discount', typeLabel: '满减', amount: '减150元', condition: '满800元', issued: 500, used: 320, startTime: '2026-03-01', endTime: '2026-06-30', scope: '全场通用', status: 'disabled', statusLabel: '已禁用', receiveType: '自动发放' },
  { id: 'C008', name: '生日礼券', type: 'none', typeLabel: '无门槛', amount: '50元', condition: '无门槛', issued: 400, used: 280, startTime: '2026-03-01', endTime: '2026-12-31', scope: '全场通用', status: 'active', statusLabel: '进行中', receiveType: '自动发放' }
])

onMounted(() => {
  total.value = couponList.value.length
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    active: 'success',
    ended: 'info',
    disabled: 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.type = ''
  queryParams.status = ''
}

const handleCreateCoupon = () => {
  createVisible.value = true
}

const handleDetail = (row: any) => {
  currentCoupon.value = {
    ...row,
    expired: row.issued - row.used,
    usedAmount: row.used * 50,
    perLimit: 1,
    receiveLogs: [
      { nickname: '张三丰', avatar: 'https://picsum.photos/24/24?random=601', time: '2026-03-30 10:30', status: 'used', orderNo: 'O20260301001' },
      { nickname: '李小龙', avatar: 'https://picsum.photos/24/24?random=602', time: '2026-03-30 09:45', status: 'unused', orderNo: '' },
      { nickname: '王小明', avatar: 'https://picsum.photos/24/24?random=603', time: '2026-03-29 16:20', status: 'used', orderNo: 'O20260302001' }
    ]
  }
  detailVisible.value = true
}

const handleIssue = (row: any) => {
  ElMessage.info('发放优惠券: ' + row.name)
}

const handleDisable = (row: any) => {
  ElMessage.success('优惠券已禁用')
  row.status = 'disabled'
}

const handleEnable = (row: any) => {
  ElMessage.success('优惠券已启用')
  row.status = 'active'
}

const saveCoupon = () => {
  ElMessage.success('优惠券已创建')
  createVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-stats {
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

.stat-icon.primary { background: #409EFF; }
.stat-icon.success { background: #67C23A; }
.stat-icon.warning { background: #E6A23C; }
.stat-icon.info { background: #909399; }
.stat-icon.danger { background: #F56C6C; }
.stat-icon { background: #667eea; }

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

.coupon-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coupon-type-badge {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.coupon-type-badge.discount { background: #F56C6C; }
.coupon-type-badge.rate { background: #E6A23C; }
.coupon-type-badge.none { background: #409EFF; }
.coupon-type-badge.shipping { background: #67C23A; }

.coupon-name {
  font-size: 14px;
  color: #303133;
}

.coupon-id {
  font-size: 12px;
  color: #909399;
}

.coupon-content {
  display: flex;
  flex-direction: column;
}

.coupon-amount {
  color: #F56C6C;
  font-weight: bold;
}

.coupon-condition {
  font-size: 12px;
  color: #909399;
}

.usage-cell {
  font-size: 12px;
  color: #606266;
}

.time-cell {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.mini-stat {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.mini-stat .value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.mini-stat .label {
  font-size: 12px;
  color: #909399;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>