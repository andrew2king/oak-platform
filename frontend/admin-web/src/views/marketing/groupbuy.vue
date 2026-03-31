<template>
  <div class="groupbuy-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>拼团活动管理</span>
          <el-button type="primary" @click="handleCreateGroupbuy">创建拼团活动</el-button>
        </div>
      </template>

      <!-- 拼团统计 -->
      <el-row :gutter="16" class="groupbuy-stats">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon people">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ groupbuyStats.totalActivities }}</div>
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
              <div class="stat-value">{{ groupbuyStats.activeGroups }}</div>
              <div class="stat-label">进行中拼团</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ groupbuyStats.completedGroups.toLocaleString() }}</div>
              <div class="stat-label">已成团</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ groupbuyStats.participants.toLocaleString() }}</div>
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
              <div class="stat-value">{{ groupbuyStats.orders.toLocaleString() }}</div>
              <div class="stat-label">拼团订单</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(groupbuyStats.amount) }}</div>
              <div class="stat-label">拼团销售额</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="活动名称">
          <el-input v-model="queryParams.name" placeholder="请输入" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="成团人数">
          <el-select v-model="queryParams.groupSize" placeholder="全部" clearable style="width: 120px">
            <el-option label="2人团" value="2" />
            <el-option label="3人团" value="3" />
            <el-option label="5人团" value="5" />
            <el-option label="10人团" value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="未开始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 拼团活动列表 -->
      <el-table :data="groupbuyList" v-loading="loading" border>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <el-image :src="row.image" class="product-image" fit="cover" />
              <div class="product-info">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-meta">
                  <span>原价 ¥{{ row.originalPrice }}</span>
                  <span>拼团价 ¥{{ row.groupPrice }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成团人数" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.groupSize }}人团</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠幅度" width="100">
          <template #default="{ row }">
            <span class="discount">省¥{{ row.originalPrice - row.groupPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="拼团进度" width="150">
          <template #default="{ row }">
            <div class="progress-cell">
              <div class="group-count">
                <el-tag type="danger">{{ row.activeGroups }}</el-tag> 进行中
                <el-tag type="success">{{ row.completedGroups }}</el-tag> 已成团
              </div>
              <div class="success-rate">成团率 {{ row.successRate }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参团人数" width="100" align="center">
          <template #default="{ row }">{{ row.totalParticipants.toLocaleString() }}人</template>
        </el-table-column>
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ row.startTime }}</div>
              <div>至 {{ row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成团时限" width="80">
          <template #default="{ row }">{{ row.expireHours }}小时</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" v-if="row.status === 'active'" @click="handlePush(row)">推团</el-button>
            <el-button link type="danger" v-if="row.status !== 'ended'" @click="handleEnd(row)">结束</el-button>
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

    <!-- 拼团详情抽屉 -->
    <el-drawer v-model="detailVisible" title="拼团活动详情" size="650px">
      <template v-if="currentGroupbuy">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称">{{ currentGroupbuy.name }}</el-descriptions-item>
          <el-descriptions-item label="原价">¥{{ currentGroupbuy.originalPrice }}</el-descriptions-item>
          <el-descriptions-item label="拼团价">¥{{ currentGroupbuy.groupPrice }}</el-descriptions-item>
          <el-descriptions-item label="成团人数">{{ currentGroupbuy.groupSize }}人</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentGroupbuy.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentGroupbuy.endTime }}</el-descriptions-item>
          <el-descriptions-item label="成团时限">{{ currentGroupbuy.expireHours }}小时</el-descriptions-item>
          <el-descriptions-item label="成团率">{{ currentGroupbuy.successRate }}%</el-descriptions-item>
        </el-descriptions>

        <el-divider>进行中的拼团</el-divider>

        <el-table :data="currentGroupbuy.activeGroupDetails" size="small" border>
          <el-table-column prop="groupId" label="团ID" width="100" />
          <el-table-column label="团长" min-width="120">
            <template #default="{ row }">
              <div class="member-cell">
                <el-avatar :src="row.leader.avatar" :size="24">{{ row.leader.name.charAt(0) }}</el-avatar>
                <span>{{ row.leader.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="参团人数" width="80">
            <template #default="{ row }">{{ row.current }}/{{ row.target }}人</template>
          </el-table-column>
          <el-table-column label="剩余时间" width="100">
            <template #default="{ row }">
              <span class="expire-time">{{ row.remaining }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag type="warning" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" size="small">推团</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-divider>参团记录</el-divider>

        <el-timeline>
          <el-timeline-item v-for="(log, index) in currentGroupbuy.joinLogs" :key="index" :timestamp="log.time" placement="top">
            <div class="log-content">
              <el-avatar :src="log.avatar" :size="24">{{ log.name.charAt(0) }}</el-avatar>
              <span>{{ log.name }}</span>
              <el-tag size="small">{{ log.action }}</el-tag>
            </div>
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { UserFilled, Timer, SuccessFilled, User, ShoppingCart, Money } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const detailVisible = ref(false)
const currentGroupbuy = ref<any>(null)

const queryParams = reactive({
  name: '',
  groupSize: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const groupbuyStats = ref({
  totalActivities: 45,
  activeGroups: 89,
  completedGroups: 1234,
  participants: 15678,
  orders: 5678,
  amount: 234567
})

const groupbuyList = ref([
  { id: 1, name: '男士商务衬衫', image: 'https://picsum.photos/60/60?random=801', originalPrice: 159, groupPrice: 89, groupSize: 2, activeGroups: 56, completedGroups: 234, totalParticipants: 678, startTime: '2026-03-15', endTime: '2026-04-15', expireHours: 24, successRate: 78, status: 'active', statusLabel: '进行中' },
  { id: 2, name: '女士针织开衫', image: 'https://picsum.photos/60/60?random=802', originalPrice: 199, groupPrice: 119, groupSize: 3, activeGroups: 34, completedGroups: 156, totalParticipants: 456, startTime: '2026-03-20', endTime: '2026-04-20', expireHours: 48, successRate: 72, status: 'active', statusLabel: '进行中' },
  { id: 3, name: '儿童纯棉T恤', image: 'https://picsum.photos/60/60?random=803', originalPrice: 69, groupPrice: 39, groupSize: 2, activeGroups: 89, completedGroups: 567, totalParticipants: 1234, startTime: '2026-03-25', endTime: '2026-04-25', expireHours: 12, successRate: 89, status: 'active', statusLabel: '进行中' },
  { id: 4, name: '运动休闲鞋', image: 'https://picsum.photos/60/60?random=804', originalPrice: 359, groupPrice: 199, groupSize: 5, activeGroups: 12, completedGroups: 45, totalParticipants: 234, startTime: '2026-03-28', endTime: '2026-04-28', expireHours: 36, successRate: 68, status: 'active', statusLabel: '进行中' },
  { id: 5, name: '时尚帆布背包', image: 'https://picsum.photos/60/60?random=805', originalPrice: 99, groupPrice: 49, groupSize: 3, activeGroups: 0, completedGroups: 123, totalParticipants: 369, startTime: '2026-02-01', endTime: '2026-02-28', expireHours: 24, successRate: 85, status: 'ended', statusLabel: '已结束' },
  { id: 6, name: '纯棉四件套', image: 'https://picsum.photos/60/60?random=806', originalPrice: 599, groupPrice: 299, groupSize: 10, activeGroups: 0, completedGroups: 0, totalParticipants: 0, startTime: '2026-04-01', endTime: '2026-04-30', expireHours: 72, successRate: 0, status: 'pending', statusLabel: '未开始' }
])

onMounted(() => {
  total.value = groupbuyList.value.length
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    ended: 'info',
    pending: 'warning'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.groupSize = ''
  queryParams.status = ''
}

const handleCreateGroupbuy = () => {
  ElMessage.info('打开创建拼团活动表单')
}

const handleDetail = (row: any) => {
  currentGroupbuy.value = {
    ...row,
    activeGroupDetails: [
      { groupId: 'G001', leader: { name: '张三丰', avatar: 'https://picsum.photos/24/24?random=901' }, current: 1, target: 2, remaining: '23:45:30', status: '缺1人' },
      { groupId: 'G002', leader: { name: '李小龙', avatar: 'https://picsum.photos/24/24?random=902' }, current: 1, target: 2, remaining: '12:30:15', status: '缺1人' },
      { groupId: 'G003', leader: { name: '王小明', avatar: 'https://picsum.photos/24/24?random=903' }, current: 2, target: 2, remaining: '00:15:00', status: '即将成团' }
    ],
    joinLogs: [
      { name: '张三丰', avatar: 'https://picsum.photos/24/24?random=901', action: '发起拼团', time: '2026-03-30 10:00' },
      { name: '李小龙', avatar: 'https://picsum.photos/24/24?random=902', action: '参与拼团', time: '2026-03-30 10:30' },
      { name: '王小明', avatar: 'https://picsum.photos/24/24?random=903', action: '参与拼团', time: '2026-03-30 11:00' }
    ]
  }
  detailVisible.value = true
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑拼团活动: ' + row.name)
}

const handlePush = (row: any) => {
  ElMessage.success('已推送拼团消息')
}

const handleEnd = (row: any) => {
  ElMessageBox.confirm('确定结束该拼团活动吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('拼团活动已结束')
    })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.groupbuy-stats {
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

.stat-icon.people { background: #409EFF; }
.stat-icon.active { background: #E6A23C; }
.stat-icon.success { background: #67C23A; }
.stat-icon.users { background: #9b59b6; }
.stat-icon.orders { background: #F56C6C; }
.stat-icon.amount { background: #667eea; }

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
  gap: 8px;
}

.discount {
  color: #F56C6C;
  font-weight: bold;
}

.progress-cell {
  font-size: 12px;
}

.group-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.success-rate {
  color: #67C23A;
  margin-top: 4px;
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

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expire-time {
  color: #E6A23C;
}

.log-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>