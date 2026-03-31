<template>
  <div class="member-tags">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员标签管理</span>
          <el-button type="primary" @click="handleCreateTag">创建标签</el-button>
        </div>
      </template>

      <!-- 标签分类 -->
      <el-tabs v-model="activeCategory" class="tag-tabs">
        <el-tab-pane label="行为标签" name="behavior">
          <div class="tag-grid">
            <div v-for="tag in behaviorTags" :key="tag.id" class="tag-card">
              <div class="tag-header">
                <el-tag :color="tag.color" effect="dark" class="tag-name">{{ tag.name }}</el-tag>
                <el-dropdown>
                  <el-icon class="tag-menu"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEditTag(tag)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="handleDeleteTag(tag)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="tag-desc">{{ tag.description }}</div>
              <div class="tag-stats">
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ tag.memberCount.toLocaleString() }}人
                </span>
                <span class="stat-item">
                  <el-icon><Refresh /></el-icon>
                  {{ tag.updateRule }}
                </span>
              </div>
              <div class="tag-preview">
                <el-avatar v-for="m in tag.sampleMembers" :key="m" :src="m" :size="24" class="sample-avatar" />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="消费标签" name="consume">
          <div class="tag-grid">
            <div v-for="tag in consumeTags" :key="tag.id" class="tag-card">
              <div class="tag-header">
                <el-tag :color="tag.color" effect="dark" class="tag-name">{{ tag.name }}</el-tag>
                <el-dropdown>
                  <el-icon class="tag-menu"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEditTag(tag)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="handleDeleteTag(tag)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="tag-desc">{{ tag.description }}</div>
              <div class="tag-stats">
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ tag.memberCount.toLocaleString() }}人
                </span>
                <span class="stat-item">
                  <el-icon><Refresh /></el-icon>
                  {{ tag.updateRule }}
                </span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="属性标签" name="attribute">
          <div class="tag-grid">
            <div v-for="tag in attributeTags" :key="tag.id" class="tag-card">
              <div class="tag-header">
                <el-tag :color="tag.color" effect="dark" class="tag-name">{{ tag.name }}</el-tag>
                <el-dropdown>
                  <el-icon class="tag-menu"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEditTag(tag)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="handleDeleteTag(tag)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="tag-desc">{{ tag.description }}</div>
              <div class="tag-stats">
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ tag.memberCount.toLocaleString() }}人
                </span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="自定义标签" name="custom">
          <div class="tag-grid">
            <div v-for="tag in customTags" :key="tag.id" class="tag-card">
              <div class="tag-header">
                <el-tag :color="tag.color" effect="dark" class="tag-name">{{ tag.name }}</el-tag>
                <el-dropdown>
                  <el-icon class="tag-menu"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEditTag(tag)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="handleDeleteTag(tag)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="tag-desc">{{ tag.description }}</div>
              <div class="tag-stats">
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ tag.memberCount.toLocaleString() }}人
                </span>
                <span class="stat-item">
                  <el-icon><Calendar /></el-icon>
                  {{ tag.createTime }}
                </span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 标签应用统计 -->
      <el-card class="usage-card" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>标签应用统计</span>
            <el-button link type="primary">导出报表</el-button>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-placeholder">
              <div class="chart-title">标签覆盖率</div>
              <div class="coverage-chart">
                <div v-for="item in coverageData" :key="item.name" class="coverage-item">
                  <div class="coverage-label">{{ item.name }}</div>
                  <el-progress :percentage="item.rate" :color="item.color" :stroke-width="10" />
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-placeholder">
              <div class="chart-title">热门标签TOP10</div>
              <el-table :data="hotTags" size="small" :show-header="false">
                <el-table-column width="50">
                  <template #default="{ $index }">
                    <span class="rank">{{ $index + 1 }}</span>
                  </template>
                </el-table-column>
                <el-table-column>
                  <template #default="{ row }">
                    <el-tag :color="row.color" effect="dark" size="small">{{ row.name }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column width="100" align="right">
                  <template #default="{ row }">{{ row.count.toLocaleString() }}人</template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-card>

    <!-- 创建/编辑标签对话框 -->
    <el-dialog v-model="tagVisible" :title="editTag ? '编辑标签' : '创建标签'" width="500px">
      <el-form :model="tagForm" label-width="100px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签分类">
          <el-select v-model="tagForm.category" style="width: 100%">
            <el-option label="行为标签" value="behavior" />
            <el-option label="消费标签" value="consume" />
            <el-option label="属性标签" value="attribute" />
            <el-option label="自定义标签" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="tagForm.color" />
        </el-form-item>
        <el-form-item label="标签描述">
          <el-input v-model="tagForm.description" type="textarea" placeholder="请输入标签描述" />
        </el-form-item>
        <el-form-item label="自动打标" v-if="tagForm.category !== 'custom'">
          <el-switch v-model="tagForm.autoTag" />
          <span class="form-hint">系统自动为符合条件的会员打标</span>
        </el-form-item>
        <el-form-item label="打标规则" v-if="tagForm.autoTag">
          <el-input v-model="tagForm.rule" type="textarea" placeholder="如：累计消费>10000元" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { MoreFilled, User, Refresh, Calendar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeCategory = ref('behavior')
const tagVisible = ref(false)
const editTag = ref<any>(null)

const tagForm = reactive({
  name: '',
  category: 'behavior',
  color: '#409EFF',
  description: '',
  autoTag: false,
  rule: ''
})

const behaviorTags = ref([
  { id: 1, name: '活跃会员', color: '#67C23A', description: '近30天有登录行为', memberCount: 23456, updateRule: '每日更新', sampleMembers: ['https://picsum.photos/24/24?random=501', 'https://picsum.photos/24/24?random=502', 'https://picsum.photos/24/24?random=503'] },
  { id: 2, name: '沉睡会员', color: '#E6A23C', description: '近60天无登录行为', memberCount: 8956, updateRule: '每日更新', sampleMembers: [] },
  { id: 3, name: '高频购买', color: '#F56C6C', description: '月均购买次数>5', memberCount: 3456, updateRule: '每周更新', sampleMembers: [] },
  { id: 4, name: '浏览达人', color: '#409EFF', description: '日均浏览商品>20', memberCount: 5678, updateRule: '每日更新', sampleMembers: [] },
  { id: 5, name: '评论达人', color: '#9b59b6', description: '累计评论>50条', memberCount: 1234, updateRule: '实时更新', sampleMembers: [] },
  { id: 6, name: '分享达人', color: '#f1c40f', description: '累计分享>30次', memberCount: 890, updateRule: '实时更新', sampleMembers: [] }
])

const consumeTags = ref([
  { id: 7, name: '高消费', color: '#F56C6C', description: '累计消费>10000元', memberCount: 4567, updateRule: '实时更新' },
  { id: 8, name: '中等消费', color: '#E6A23C', description: '累计消费5000-10000元', memberCount: 12345, updateRule: '实时更新' },
  { id: 9, name: '低消费', color: '#409EFF', description: '累计消费<1000元', memberCount: 34567, updateRule: '实时更新' },
  { id: 10, name: '客单价高', color: '#67C23A', description: '平均客单价>500元', memberCount: 2345, updateRule: '每周更新' },
  { id: 11, name: '折扣敏感', color: '#909399', description: '常用优惠券下单', memberCount: 15678, updateRule: '每周更新' },
  { id: 12, name: '新品购买', color: '#9b59b6', description: '常购买新品上市商品', memberCount: 3456, updateRule: '每周更新' }
])

const attributeTags = ref([
  { id: 13, name: '女性', color: '#F56C6C', description: '性别为女性', memberCount: 56789 },
  { id: 14, name: '男性', color: '#409EFF', description: '性别为男性', memberCount: 32754 },
  { id: 15, name: '年轻客群', color: '#67C23A', description: '年龄18-30岁', memberCount: 23456 },
  { id: 16, name: '中年客群', color: '#E6A23C', description: '年龄30-50岁', memberCount: 45678 },
  { id: 17, name: '一线城市', color: '#9b59b6', description: '居住在一线城市', memberCount: 12345 },
  { id: 18, name: '学生群体', color: '#f1c40f', description: '职业为学生', memberCount: 8956 }
])

const customTags = ref([
  { id: 19, name: 'VIP客户', color: '#9b59b6', description: '客服手动标记VIP客户', memberCount: 567, createTime: '2026-03-15' },
  { id: 20, name: '投诉客户', color: '#F56C6C', description: '有过投诉记录的客户', memberCount: 89, createTime: '2026-03-10' },
  { id: 21, name: '客服关注', color: '#E6A23C', description: '客服需重点关注', memberCount: 234, createTime: '2026-03-20' },
  { id: 22, name: '潜力客户', color: '#67C23A', description: '营销潜力较大的客户', memberCount: 456, createTime: '2026-03-25' }
])

const coverageData = ref([
  { name: '行为标签覆盖', rate: 85, color: '#67C23A' },
  { name: '消费标签覆盖', rate: 92, color: '#409EFF' },
  { name: '属性标签覆盖', rate: 78, color: '#E6A23C' },
  { name: '自定义标签覆盖', rate: 15, color: '#9b59b6' }
])

const hotTags = ref([
  { name: '活跃会员', color: '#67C23A', count: 23456 },
  { name: '女性', color: '#F56C6C', count: 56789 },
  { name: '高消费', color: '#F56C6C', count: 4567 },
  { name: '一线城市', color: '#9b59b6', count: 12345 },
  { name: '折扣敏感', color: '#909399', count: 15678 },
  { name: '中等消费', color: '#E6A23C', count: 12345 },
  { name: '年轻客群', color: '#67C23A', count: 23456 },
  { name: '低消费', color: '#409EFF', count: 34567 },
  { name: '沉睡会员', color: '#E6A23C', count: 8956 },
  { name: '浏览达人', color: '#409EFF', count: 5678 }
])

const handleCreateTag = () => {
  editTag.value = null
  Object.assign(tagForm, { name: '', category: 'behavior', color: '#409EFF', description: '', autoTag: false, rule: '' })
  tagVisible.value = true
}

const handleEditTag = (tag: any) => {
  editTag.value = tag
  Object.assign(tagForm, tag)
  tagVisible.value = true
}

const handleDeleteTag = (tag: any) => {
  ElMessageBox.confirm('确定删除该标签吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('标签已删除')
    })
}

const saveTag = () => {
  ElMessage.success(editTag.value ? '标签已更新' : '标签已创建')
  tagVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-tabs {
  margin-bottom: 20px;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tag-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tag-name {
  font-size: 14px;
}

.tag-menu {
  cursor: pointer;
  color: #909399;
}

.tag-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
}

.tag-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-preview {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.sample-avatar {
  border: 1px solid #fff;
}

.usage-card :deep(.el-card__header) {
  padding: 12px 20px;
}

.chart-placeholder {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.coverage-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coverage-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coverage-label {
  font-size: 13px;
  color: #606266;
  width: 100px;
}

.coverage-item .el-progress {
  flex: 1;
}

.rank {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #909399;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style>