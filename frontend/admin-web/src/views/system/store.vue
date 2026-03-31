<template>
  <div class="system-store">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>门店管理</span>
          <el-button type="primary" @click="handleAdd">新增门店</el-button>
        </div>
      </template>

      <!-- 门店统计 -->
      <el-row :gutter="16" class="store-stats">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409EFF"><el-icon><Shop /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ storeStats.total }}</div>
              <div class="stat-label">门店总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A"><el-icon><SuccessFilled /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ storeStats.active }}</div>
              <div class="stat-label">营业中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C"><el-icon><Clock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ storeStats.preparing }}</div>
              <div class="stat-label">筹备中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C"><el-icon><WarningFilled /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ storeStats.closed }}</div>
              <div class="stat-label">已关闭</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="门店名称">
          <el-input v-model="queryParams.name" placeholder="请输入" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="queryParams.region" placeholder="全部" clearable style="width: 120px">
            <el-option label="华东区" value="east" />
            <el-option label="华南区" value="south" />
            <el-option label="华北区" value="north" />
            <el-option label="西南区" value="west" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="营业中" value="active" />
            <el-option label="筹备中" value="preparing" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 门店列表 -->
      <el-table :data="storeList" v-loading="loading" border>
        <el-table-column prop="code" label="门店编码" width="120" />
        <el-table-column label="门店信息" min-width="200">
          <template #default="{ row }">
            <div class="store-cell">
              <el-image :src="row.image" class="store-image" fit="cover" />
              <div class="store-info">
                <div class="store-name">{{ row.name }}</div>
                <div class="store-address">{{ row.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="区域" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.region }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="店长" width="100">
          <template #default="{ row }">
            <div>{{ row.manager }}</div>
            <div class="sub-text">{{ row.managerPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="营业时间" width="120">
          <template #default="{ row }">{{ row.openTime }} - {{ row.closeTime }}</template>
        </el-table-column>
        <el-table-column label="员工数" width="80" align="center">
          <template #default="{ row }">{{ row.staffCount }}人</template>
        </el-table-column>
        <el-table-column label="月销售额" width="100" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatMoney(row.monthAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" v-if="row.status !== 'closed'" @click="handleClose(row)">关闭</el-button>
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
import { Shop, SuccessFilled, Clock, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)

const queryParams = reactive({
  name: '',
  region: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const storeStats = ref({
  total: 128,
  active: 98,
  preparing: 15,
  closed: 15
})

const storeList = ref([
  { id: 1, code: 'BJ001', name: '北京朝阳店', image: 'https://picsum.photos/60/60?random=1201', address: '北京市朝阳区建国路88号', region: '华北区', manager: '张经理', managerPhone: '138****0001', openTime: '09:00', closeTime: '22:00', staffCount: 25, monthAmount: 1567890, status: 'active', statusLabel: '营业中' },
  { id: 2, code: 'SH001', name: '上海静安店', image: 'https://picsum.photos/60/60?random=1202', address: '上海市静安区南京西路1038号', region: '华东区', manager: '李经理', managerPhone: '138****0002', openTime: '09:00', closeTime: '22:00', staffCount: 28, monthAmount: 2345678, status: 'active', statusLabel: '营业中' },
  { id: 3, code: 'GZ001', name: '广州天河店', image: 'https://picsum.photos/60/60?random=1203', address: '广州市天河区天河路208号', region: '华南区', manager: '王经理', managerPhone: '138****0003', openTime: '09:30', closeTime: '22:30', staffCount: 22, monthAmount: 1890123, status: 'active', statusLabel: '营业中' },
  { id: 4, code: 'SZ001', name: '深圳福田店', image: 'https://picsum.photos/60/60?random=1204', address: '深圳市福田区深南大道1000号', region: '华南区', manager: '赵经理', managerPhone: '138****0004', openTime: '09:00', closeTime: '21:30', staffCount: 20, monthAmount: 1456789, status: 'active', statusLabel: '营业中' },
  { id: 5, code: 'CD001', name: '成都锦江店', image: 'https://picsum.photos/60/60?random=1205', address: '成都市锦江区春熙路88号', region: '西南区', manager: '孙经理', managerPhone: '138****0005', openTime: '10:00', closeTime: '22:00', staffCount: 18, monthAmount: 987654, status: 'active', statusLabel: '营业中' },
  { id: 6, code: 'HZ001', name: '杭州西湖店', image: 'https://picsum.photos/60/60?random=1206', address: '杭州市西湖区文三路199号', region: '华东区', manager: '周经理', managerPhone: '138****0006', openTime: '09:00', closeTime: '22:00', staffCount: 15, monthAmount: 0, status: 'preparing', statusLabel: '筹备中' },
  { id: 7, code: 'NJ001', name: '南京新街口店', image: 'https://picsum.photos/60/60?random=1207', address: '南京市秦淮区中山路18号', region: '华东区', manager: '-', managerPhone: '-', openTime: '-', closeTime: '-', staffCount: 0, monthAmount: 0, status: 'preparing', statusLabel: '筹备中' },
  { id: 8, code: 'TJ001', name: '天津和平店', image: 'https://picsum.photos/60/60?random=1208', address: '天津市和平区南京路189号', region: '华北区', manager: '-', managerPhone: '-', openTime: '-', closeTime: '-', staffCount: 0, monthAmount: 0, status: 'closed', statusLabel: '已关闭' }
])

onMounted(() => {
  total.value = storeList.value.length
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    preparing: 'warning',
    closed: 'info'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.region = ''
  queryParams.status = ''
}

const handleAdd = () => {
  ElMessage.info('打开新增门店表单')
}

const handleDetail = (row: any) => {
  ElMessage.info('查看门店详情: ' + row.name)
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑门店: ' + row.name)
}

const handleClose = (row: any) => {
  ElMessageBox.confirm('确定关闭该门店吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('门店已关闭')
    })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-stats {
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
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.search-form {
  margin-bottom: 16px;
}

.store-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.store-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.store-name {
  font-size: 14px;
  color: #303133;
}

.store-address {
  font-size: 12px;
  color: #909399;
}

.sub-text {
  font-size: 12px;
  color: #909399;
}

.amount {
  color: #F56C6C;
  font-weight: 500;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>