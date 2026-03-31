<template>
  <div class="member-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员中心</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出会员
          </el-button>
        </div>
      </template>

      <!-- 会员统计 -->
      <el-row :gutter="16" class="member-stats">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ memberStats.total.toLocaleString() }}</div>
            <div class="stat-label">会员总数</div>
            <div class="stat-trend up">↑ 12.5%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ memberStats.todayNew }}</div>
            <div class="stat-label">今日新增</div>
            <div class="stat-trend up">↑ 8.3%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ memberStats.active }}</div>
            <div class="stat-label">活跃会员</div>
            <div class="stat-trend up">↑ 5.2%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">¥{{ memberStats.avgAmount }}</div>
            <div class="stat-label">人均消费</div>
            <div class="stat-trend up">↑ 3.8%</div>
          </div>
        </el-col>
      </el-row>

      <!-- 等级分布 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="24">
          <div class="level-stats">
            <div class="level-item" v-for="(level, index) in levelStats" :key="index">
              <div class="level-icon" :style="{ background: level.color }">{{ level.icon }}</div>
              <div class="level-info">
                <div class="level-name">{{ level.name }}</div>
                <div class="level-count">{{ level.count.toLocaleString() }}人</div>
              </div>
              <el-progress :percentage="level.percentage" :stroke-width="8" :color="level.color" />
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="会员搜索">
          <el-input v-model="queryParams.keyword" placeholder="会员编号/手机号/昵称" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="queryParams.levelId" placeholder="选择等级" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="普通会员" :value="1" />
            <el-option label="银卡会员" :value="2" />
            <el-option label="金卡会员" :value="3" />
            <el-option label="钻石会员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
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
        <el-table-column label="会员信息" min-width="200">
          <template #default="{ row }">
            <div class="member-cell">
              <el-avatar :size="48" :src="row.avatar">
                {{ row.nickname?.charAt(0) }}
              </el-avatar>
              <div class="member-info">
                <div class="member-name">
                  {{ row.nickname }}
                  <el-tag :type="getLevelType(row.levelId)" size="small" effect="plain">{{ row.levelName }}</el-tag>
                </div>
                <div class="member-meta">
                  <span>{{ row.memberNo }}</span>
                  <span>{{ row.phone }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="积分" width="100" align="center">
          <template #default="{ row }">
            <div class="points-cell">
              <el-icon :color="'#E6A23C'"><Coin /></el-icon>
              <span>{{ row.points.toLocaleString() }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="消费金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="80" align="center" />
        <el-table-column label="注册来源" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="120" />
        <el-table-column prop="createTime" label="注册时间" width="120" />
        <el-table-column label="标签" width="160">
          <template #default="{ row }">
            <el-tag v-for="tag in getMemberTags(row)" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handlePoints(row)">积分</el-button>
            <el-button link type="primary" @click="handleLevel(row)">等级</el-button>
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

    <!-- 会员详情抽屉 -->
    <el-drawer v-model="detailVisible" title="会员详情" size="650px">
      <template v-if="currentMember">
        <div class="member-header">
          <el-avatar :size="80" :src="currentMember.avatar" />
          <div class="member-basic">
            <div class="member-name-large">
              {{ currentMember.nickname }}
              <el-tag :type="getLevelType(currentMember.levelId)" effect="dark">{{ currentMember.levelName }}</el-tag>
            </div>
            <div class="member-no">{{ currentMember.memberNo }}</div>
          </div>
        </div>

        <el-divider />

        <el-descriptions :column="2" border>
          <el-descriptions-item label="手机号">{{ currentMember.phone }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentMember.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentMember.gender === 1 ? '男' : currentMember.gender === 2 ? '女' : '未知' }}</el-descriptions-item>
          <el-descriptions-item label="生日">{{ currentMember.birthday || '-' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentMember.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ currentMember.lastLoginTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>会员资产</el-divider>

        <el-row :gutter="16">
          <el-col :span="8">
            <div class="asset-card">
              <div class="asset-value">{{ currentMember.points.toLocaleString() }}</div>
              <div class="asset-label">当前积分</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="asset-card">
              <div class="asset-value">¥{{ currentMember.totalAmount.toLocaleString() }}</div>
              <div class="asset-label">累计消费</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="asset-card">
              <div class="asset-value">{{ currentMember.orderCount }}</div>
              <div class="asset-label">订单数量</div>
            </div>
          </el-col>
        </el-row>

        <el-divider>会员标签</el-divider>

        <div class="tags-container">
          <el-tag v-for="tag in currentMember.tags" :key="tag" class="tag-large">{{ tag }}</el-tag>
        </div>

        <el-divider>收货地址</el-divider>

        <div class="address-list">
          <div v-for="addr in currentMember.addressList" :key="addr.id" class="address-item">
            <div class="address-header">
              <span>{{ addr.name }}</span>
              <span>{{ addr.phone }}</span>
              <el-tag v-if="addr.isDefault" type="success" size="small">默认</el-tag>
            </div>
            <div class="address-detail">{{ addr.address }}</div>
          </div>
        </div>

        <el-divider>最近订单</el-divider>

        <el-table :data="currentMember.recentOrders" size="small" border>
          <el-table-column prop="orderNo" label="订单号" width="140" />
          <el-table-column label="金额" width="80">
            <template #default="{ row }">¥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 4 ? 'success' : 'primary'" size="small">
                {{ row.status === 4 ? '已完成' : '处理中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="下单时间" />
        </el-table>

        <el-divider>积分记录</el-divider>

        <el-table :data="currentMember.pointsLogs" size="small" border>
          <el-table-column prop="changeType" label="类型" width="100" />
          <el-table-column label="积分" width="80">
            <template #default="{ row }">
              <span :class="row.points > 0 ? 'points-add' : 'points-minus'">
                {{ row.points > 0 ? '+' : '' }}{{ row.points }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="余额" width="100" />
          <el-table-column prop="time" label="时间" />
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Download, Search, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Mock from '@/mock'

const loading = ref(false)
const total = ref(0)
const tableData = ref<any[]>([])
const detailVisible = ref(false)
const currentMember = ref<any>(null)

const queryParams = reactive({
  keyword: '',
  levelId: '',
  dateRange: [],
  pageNum: 1,
  pageSize: 10
})

const memberStats = ref({
  total: 89543,
  todayNew: 356,
  active: 23456,
  avgAmount: 456
})

const levelStats = ref([
  { name: '钻石会员', icon: '💎', color: '#9b59b6', count: 1234, percentage: 1.4 },
  { name: '金卡会员', icon: '🥇', color: '#f1c40f', count: 8956, percentage: 10 },
  { name: '银卡会员', icon: '🥈', color: '#95a5a6', count: 23456, percentage: 26.2 },
  { name: '普通会员', icon: '⭐', color: '#3498db', count: 55897, percentage: 62.4 }
])

onMounted(() => {
  loadTableData()
})

const loadTableData = () => {
  loading.value = true
  setTimeout(() => {
    const result = Mock.getMembers(queryParams)
    tableData.value = result.list
    total.value = result.total
    loading.value = false
  }, 500)
}

const getLevelType = (levelId: number) => {
  const types: Record<number, string> = { 1: 'info', 2: '', 3: 'warning', 4: 'danger' }
  return types[levelId] || 'info'
}

const getMemberTags = (row: any) => {
  const tags = []
  if (row.totalAmount > 10000) tags.push('高消费')
  if (row.orderCount > 20) tags.push('活跃')
  return tags.slice(0, 2)
}

const handleSearch = () => {
  queryParams.pageNum = 1
  loadTableData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.levelId = ''
  queryParams.dateRange = []
  handleSearch()
}

const handleExport = () => {
  ElMessage.success('正在导出会员数据...')
}

const handleDetail = (row: any) => {
  currentMember.value = Mock.getMemberDetail(row.id)
  detailVisible.value = true
}

const handlePoints = (row: any) => {
  ElMessage.info('管理积分: ' + row.memberNo)
}

const handleLevel = (row: any) => {
  ElMessage.info('调整等级: ' + row.memberNo)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-stats {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 8px;
}

.stat-trend.up { color: #67C23A; }
.stat-trend.down { color: #F56C6C; }

.level-stats {
  display: flex;
  gap: 16px;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.level-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.level-info {
  display: flex;
  justify-content: space-between;
}

.level-name {
  font-size: 14px;
  color: #303133;
}

.level-count {
  font-size: 12px;
  color: #909399;
}

.search-form {
  margin-bottom: 16px;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-info {
  flex: 1;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #303133;
}

.member-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.points-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.amount {
  font-weight: 500;
  color: #F56C6C;
}

.tag-item {
  margin-right: 4px;
  margin-bottom: 4px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.member-name-large {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-no {
  color: #909399;
  margin-top: 4px;
}

.asset-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.asset-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.asset-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-large {
  padding: 4px 12px;
  font-size: 14px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-weight: 500;
}

.address-detail {
  font-size: 13px;
  color: #606266;
}

.points-add { color: #67C23A; font-weight: bold; }
.points-minus { color: #F56C6C; font-weight: bold; }
</style>