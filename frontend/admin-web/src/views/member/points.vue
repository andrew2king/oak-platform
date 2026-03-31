<template>
  <div class="member-points">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>积分管理</span>
          <div>
            <el-button type="primary" @click="handleBatchAdjust">批量调整</el-button>
            <el-button @click="handleExport">导出记录</el-button>
          </div>
        </div>
      </template>

      <!-- 积分统计 -->
      <el-row :gutter="16" class="points-stats">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon gold">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pointsStats.totalPoints.toLocaleString() }}</div>
              <div class="stat-label">总发放积分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon green">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pointsStats.usedPoints.toLocaleString() }}</div>
              <div class="stat-label">已使用积分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon blue">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pointsStats.availablePoints.toLocaleString() }}</div>
              <div class="stat-label">可用积分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon orange">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pointsStats.expiringPoints.toLocaleString() }}</div>
              <div class="stat-label">即将过期</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 积分规则配置 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="rule-card">
            <template #header>
              <span>积分获取规则</span>
            </template>
            <el-table :data="earnRules" size="small">
              <el-table-column prop="name" label="获取方式" width="120" />
              <el-table-column label="积分值" width="100">
                <template #default="{ row }">
                  <span class="points-value add">+{{ row.points }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" size="small" />
                </template>
              </el-table-column>
            </el-table>
            <div class="rule-footer">
              <el-button type="primary" size="small">保存规则</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="rule-card">
            <template #header>
              <span>积分使用规则</span>
            </template>
            <el-form label-width="100px" size="small">
              <el-form-item label="兑换比例">
                <el-input-number v-model="usageRules.exchangeRate" :min="1" :max="100" />
                <span class="form-hint">100积分 = {{ usageRules.exchangeRate }}元</span>
              </el-form-item>
              <el-form-item label="最低使用">
                <el-input-number v-model="usageRules.minUse" :min="0" />
                <span class="form-hint">积分</span>
              </el-form-item>
              <el-form-item label="使用上限">
                <el-input-number v-model="usageRules.maxPercent" :min="0" :max="100" />
                <span class="form-hint">订单金额%</span>
              </el-form-item>
              <el-form-item label="有效期">
                <el-select v-model="usageRules.expirePeriod" style="width: 100%">
                  <el-option label="永久有效" value="forever" />
                  <el-option label="1年" value="1year" />
                  <el-option label="2年" value="2year" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary">保存规则</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- 积分记录查询 -->
      <el-card style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>积分变动记录</span>
          </div>
        </template>
        <el-form :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="会员搜索">
            <el-input v-model="queryParams.keyword" placeholder="会员编号/手机号" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="变动类型">
            <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 120px">
              <el-option label="获取" value="earn" />
              <el-option label="使用" value="use" />
              <el-option label="过期" value="expire" />
              <el-option label="调整" value="adjust" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker v-model="queryParams.dateRange" type="daterange" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="pointsLogs" v-loading="loading" border>
          <el-table-column label="会员信息" min-width="150">
            <template #default="{ row }">
              <div class="member-cell">
                <el-avatar :src="row.avatar" :size="32">{{ row.nickname.charAt(0) }}</el-avatar>
                <div>
                  <div>{{ row.nickname }}</div>
                  <div class="sub-text">{{ row.memberNo }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="变动类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getLogType(row.type)" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="积分变动" width="100" align="center">
            <template #default="{ row }">
              <span :class="['points-value', row.points > 0 ? 'add' : 'minus']">
                {{ row.points > 0 ? '+' : '' }}{{ row.points }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="变动后余额" width="100" align="center">
            <template #default="{ row }">{{ row.balance.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="source" label="来源/用途" min-width="150" />
          <el-table-column prop="remark" label="备注" width="120" />
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Coin, ShoppingCart, Wallet, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  type: '',
  dateRange: [],
  pageNum: 1,
  pageSize: 10
})

const pointsStats = ref({
  totalPoints: 12345678,
  usedPoints: 5678901,
  availablePoints: 6666777,
  expiringPoints: 123456
})

const earnRules = ref([
  { name: '消费获取', points: '消费金额×等级倍率', desc: '消费1元获得对应等级倍率积分', enabled: true },
  { name: '注册奖励', points: 100, desc: '新会员注册成功', enabled: true },
  { name: '签到奖励', points: 5, desc: '每日签到', enabled: true },
  { name: '评价奖励', points: 10, desc: '完成商品评价', enabled: true },
  { name: '分享奖励', points: 20, desc: '分享商品给好友', enabled: true },
  { name: '生日奖励', points: 500, desc: '会员生日当天', enabled: true }
])

const usageRules = reactive({
  exchangeRate: 1,
  minUse: 100,
  maxPercent: 30,
  expirePeriod: '2year'
})

const pointsLogs = ref([
  { id: 1, nickname: '张三丰', memberNo: 'M10001', avatar: 'https://picsum.photos/32/32?random=401', type: '获取', points: 500, balance: 12500, source: '订单消费', remark: '订单#O20260301001', time: '2026-03-30 14:30' },
  { id: 2, nickname: '李小龙', memberNo: 'M10002', avatar: 'https://picsum.photos/32/32?random=402', type: '使用', points: -200, balance: 3800, source: '积分兑换', remark: '兑换优惠券', time: '2026-03-30 12:20' },
  { id: 3, nickname: '王小明', memberNo: 'M10003', avatar: 'https://picsum.photos/32/32?random=403', type: '获取', points: 100, balance: 2100, source: '注册奖励', remark: '新会员注册', time: '2026-03-30 10:00' },
  { id: 4, nickname: '赵云飞', memberNo: 'M10004', avatar: 'https://picsum.photos/32/32?random=404', type: '过期', points: -50, balance: 8950, source: '积分过期', remark: '2024年积分过期', time: '2026-03-30 00:00' },
  { id: 5, nickname: '孙悟空', memberNo: 'M10005', avatar: 'https://picsum.photos/32/32?random=405', type: '获取', points: 20, balance: 4520, source: '分享奖励', remark: '分享商品', time: '2026-03-29 16:45' },
  { id: 6, nickname: '周芷若', memberNo: 'M10006', avatar: 'https://picsum.photos/32/32?random=406', type: '调整', points: 1000, balance: 3500, source: '人工调整', remark: '补偿积分', time: '2026-03-29 10:30' },
  { id: 7, nickname: '韦小宝', memberNo: 'M10007', avatar: 'https://picsum.photos/32/32?random=407', type: '获取', points: 5, balance: 1205, source: '签到奖励', remark: '每日签到', time: '2026-03-29 08:00' },
  { id: 8, nickname: '令狐冲', memberNo: 'M10008', avatar: 'https://picsum.photos/32/32?random=408', type: '使用', points: -500, balance: 4500, source: '订单抵扣', remark: '订单#O20260302001', time: '2026-03-28 20:15' }
])

onMounted(() => {
  total.value = pointsLogs.value.length
})

const getLogType = (type: string) => {
  const types: Record<string, string> = {
    '获取': 'success',
    '使用': 'primary',
    '过期': 'warning',
    '调整': 'info'
  }
  return types[type] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.type = ''
  queryParams.dateRange = []
}

const handleBatchAdjust = () => {
  ElMessage.info('打开批量调整积分表单')
}

const handleExport = () => {
  ElMessage.success('正在导出积分记录...')
}

const handleDetail = (row: any) => {
  ElMessage.info('查看积分详情: ' + row.memberNo)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-stats {
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

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.gold { background: linear-gradient(135deg, #f1c40f, #f39c12); }
.stat-icon.green { background: linear-gradient(135deg, #67C23A, #85ce61); }
.stat-icon.blue { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.stat-icon.orange { background: linear-gradient(135deg, #E6A23C, #ebb563); }

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.rule-card {
  height: 100%;
}

.rule-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.search-form {
  margin-bottom: 16px;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-text {
  font-size: 12px;
  color: #909399;
}

.points-value.add { color: #67C23A; font-weight: bold; }
.points-value.minus { color: #F56C6C; font-weight: bold; }

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>