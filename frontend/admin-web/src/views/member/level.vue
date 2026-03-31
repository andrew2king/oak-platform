<template>
  <div class="member-level">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员等级管理</span>
          <el-button type="primary" @click="handleAddLevel">新增等级</el-button>
        </div>
      </template>

      <!-- 等级概览 -->
      <div class="level-overview">
        <div v-for="(level, index) in levels" :key="index" class="level-card" :class="level.code">
          <div class="level-header">
            <div class="level-icon">{{ level.icon }}</div>
            <div class="level-name">{{ level.name }}</div>
            <el-tag :type="level.status === 1 ? 'success' : 'info'" size="small">
              {{ level.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </div>
          <div class="level-stats">
            <div class="stat-item">
              <span class="stat-label">会员数量</span>
              <span class="stat-value">{{ level.memberCount.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">升级条件</span>
              <span class="stat-value">累计消费 ¥{{ level.upgradeAmount.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">折扣权益</span>
              <span class="stat-value">{{ level.discount }}折</span>
            </div>
          </div>
          <div class="level-privileges">
            <el-tag v-for="p in level.privileges" :key="p" size="small" effect="plain" class="privilege-tag">{{ p }}</el-tag>
          </div>
          <div class="level-actions">
            <el-button link type="primary" @click="handleEdit(level)">编辑</el-button>
            <el-button link type="primary" @click="handlePrivileges(level)">权益配置</el-button>
            <el-button link type="warning" v-if="level.status === 1" @click="handleToggleStatus(level)">禁用</el-button>
            <el-button link type="success" v-if="level.status === 0" @click="handleToggleStatus(level)">启用</el-button>
          </div>
        </div>
      </div>

      <!-- 等级规则配置 -->
      <el-card class="rules-card">
        <template #header>
          <span>等级规则配置</span>
        </template>
        <el-form :model="rulesForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="升级规则">
                <el-radio-group v-model="rulesForm.upgradeRule">
                  <el-radio label="amount">按累计消费金额</el-radio>
                  <el-radio label="points">按累计积分</el-radio>
                  <el-radio label="both">金额+积分综合</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="降级规则">
                <el-radio-group v-model="rulesForm.downgradeRule">
                  <el-radio label="none">不自动降级</el-radio>
                  <el-radio label="inactive">按活跃度降级</el-radio>
                  <el-radio label="expire">按有效期降级</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保级周期">
                <el-select v-model="rulesForm.keepPeriod" style="width: 100%">
                  <el-option label="永久保级" value="forever" />
                  <el-option label="1年" value="1year" />
                  <el-option label="6个月" value="6month" />
                  <el-option label="3个月" value="3month" />
                </el-select>
              </el-form-item>
              <el-form-item label="活跃度判定">
                <el-input-number v-model="rulesForm.activeDays" :min="1" :max="365" />
                <span class="form-hint">天内需有消费行为</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="saveRules">保存规则</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 等级变更记录 -->
      <el-card class="logs-card" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>等级变更记录</span>
            <el-button link type="primary">查看全部</el-button>
          </div>
        </template>
        <el-table :data="levelLogs" size="small" border>
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
          <el-table-column label="变更类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === '升级' ? 'success' : 'warning'" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="原等级" width="80">
            <template #default="{ row }">
              <span class="level-badge" :class="row.fromLevel">{{ row.fromLevelName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="新等级" width="80">
            <template #default="{ row }">
              <span class="level-badge" :class="row.toLevel">{{ row.toLevelName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="变更原因" min-width="120" />
          <el-table-column prop="time" label="变更时间" width="160" />
        </el-table>
      </el-card>
    </el-card>

    <!-- 新增/编辑等级对话框 -->
    <el-dialog v-model="levelVisible" :title="editLevel ? '编辑等级' : '新增等级'" width="500px">
      <el-form :model="levelForm" label-width="100px">
        <el-form-item label="等级名称">
          <el-input v-model="levelForm.name" placeholder="如：钻石会员" />
        </el-form-item>
        <el-form-item label="等级图标">
          <el-input v-model="levelForm.icon" placeholder="如：💎" style="width: 80px" />
        </el-form-item>
        <el-form-item label="升级金额">
          <el-input-number v-model="levelForm.upgradeAmount" :min="0" :step="1000" />
        </el-form-item>
        <el-form-item label="折扣权益">
          <el-slider v-model="levelForm.discount" :min="50" :max="100" :step="5" show-input />
          <span class="form-hint">折扣比例 (如：95表示9.5折)</span>
        </el-form-item>
        <el-form-item label="积分倍率">
          <el-input-number v-model="levelForm.pointsRate" :min="1" :max="10" :precision="1" />
          <span class="form-hint">消费积分倍率</span>
        </el-form-item>
        <el-form-item label="专属权益">
          <el-select v-model="levelForm.privileges" multiple style="width: 100%">
            <el-option label="专属客服" value="专属客服" />
            <el-option label="优先发货" value="优先发货" />
            <el-option label="免运费" value="免运费" />
            <el-option label="生日礼包" value="生日礼包" />
            <el-option label="新品优先" value="新品优先" />
            <el-option label="专属活动" value="专属活动" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="levelVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLevel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const levelVisible = ref(false)
const editLevel = ref<any>(null)

const levelForm = reactive({
  name: '',
  icon: '',
  upgradeAmount: 0,
  discount: 100,
  pointsRate: 1,
  privileges: []
})

const rulesForm = reactive({
  upgradeRule: 'amount',
  downgradeRule: 'inactive',
  keepPeriod: '1year',
  activeDays: 90
})

const levels = ref([
  { id: 1, name: '普通会员', code: 'normal', icon: '⭐', status: 1, memberCount: 55897, upgradeAmount: 0, discount: 100, pointsRate: 1, privileges: ['基础积分', '新人礼包'] },
  { id: 2, name: '银卡会员', code: 'silver', icon: '🥈', status: 1, memberCount: 23456, upgradeAmount: 1000, discount: 98, pointsRate: 1.5, privileges: ['基础积分', '生日礼包', '免运费券'] },
  { id: 3, name: '金卡会员', code: 'gold', icon: '🥇', status: 1, memberCount: 8956, upgradeAmount: 5000, discount: 95, pointsRate: 2, privileges: ['基础积分', '生日礼包', '免运费', '优先发货', '专属客服'] },
  { id: 4, name: '钻石会员', code: 'diamond', icon: '💎', status: 1, memberCount: 1234, upgradeAmount: 10000, discount: 90, pointsRate: 3, privileges: ['基础积分', '生日礼包', '免运费', '优先发货', '专属客服', '新品优先', '专属活动'] }
])

const levelLogs = ref([
  { id: 1, nickname: '张三丰', memberNo: 'M10001', avatar: 'https://picsum.photos/32/32?random=301', type: '升级', fromLevel: 'silver', fromLevelName: '银卡', toLevel: 'gold', toLevelName: '金卡', reason: '累计消费达到5000元', time: '2026-03-30 10:30' },
  { id: 2, nickname: '李小龙', memberNo: 'M10002', avatar: 'https://picsum.photos/32/32?random=302', type: '升级', fromLevel: 'normal', fromLevelName: '普通', toLevel: 'silver', toLevelName: '银卡', reason: '累计消费达到1000元', time: '2026-03-30 09:45' },
  { id: 3, nickname: '王小明', memberNo: 'M10003', avatar: 'https://picsum.photos/32/32?random=303', type: '降级', fromLevel: 'gold', fromLevelName: '金卡', toLevel: 'silver', toLevelName: '银卡', reason: '连续90天无消费', time: '2026-03-29 23:00' },
  { id: 4, nickname: '赵云飞', memberNo: 'M10004', avatar: 'https://picsum.photos/32/32?random=304', type: '升级', fromLevel: 'gold', fromLevelName: '金卡', toLevel: 'diamond', toLevelName: '钻石', reason: '累计消费达到10000元', time: '2026-03-28 15:20' },
  { id: 5, nickname: '孙悟空', memberNo: 'M10005', avatar: 'https://picsum.photos/32/32?random=305', type: '降级', fromLevel: 'silver', fromLevelName: '银卡', toLevel: 'normal', toLevelName: '普通', reason: '连续180天无消费', time: '2026-03-25 00:00' }
])

const handleAddLevel = () => {
  editLevel.value = null
  Object.assign(levelForm, { name: '', icon: '', upgradeAmount: 0, discount: 100, pointsRate: 1, privileges: [] })
  levelVisible.value = true
}

const handleEdit = (level: any) => {
  editLevel.value = level
  Object.assign(levelForm, level)
  levelVisible.value = true
}

const handlePrivileges = (level: any) => {
  ElMessage.info('配置等级权益: ' + level.name)
}

const handleToggleStatus = (level: any) => {
  ElMessage.success(level.status === 1 ? '已禁用等级' : '已启用等级')
  level.status = level.status === 1 ? 0 : 1
}

const saveLevel = () => {
  ElMessage.success(editLevel.value ? '等级已更新' : '等级已创建')
  levelVisible.value = false
}

const saveRules = () => {
  ElMessage.success('等级规则已保存')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.level-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebeef5;
}

.level-card.normal { border-top: 3px solid #3498db; }
.level-card.silver { border-top: 3px solid #95a5a6; }
.level-card.gold { border-top: 3px solid #f1c40f; }
.level-card.diamond { border-top: 3px solid #9b59b6; }

.level-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.level-icon {
  font-size: 24px;
}

.level-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.level-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-value {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.level-privileges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.privilege-tag {
  margin: 0;
}

.level-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.rules-card {
  margin-top: 20px;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.logs-card :deep(.el-card__header) {
  padding: 12px 20px;
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

.level-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.level-badge.normal { background: #3498db; color: #fff; }
.level-badge.silver { background: #95a5a6; color: #fff; }
.level-badge.gold { background: #f1c40f; color: #fff; }
.level-badge.diamond { background: #9b59b6; color: #fff; }
</style>