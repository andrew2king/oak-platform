<template>
  <div class="category-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>分类树</span>
              <el-button type="primary" size="small" @click="handleAddRoot">添加根分类</el-button>
            </div>
          </template>

          <!-- 分类统计 -->
          <div class="category-stats">
            <span>共 <b>{{ categoryStats.total }}</b> 个分类</span>
            <span>启用 <b>{{ categoryStats.active }}</b> 个</span>
          </div>

          <el-tree
            :data="treeData"
            :props="{ label: 'categoryName', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span class="node-label">
                  <span v-if="data.icon" class="node-icon">{{ data.icon }}</span>
                  <span>{{ node.label }}</span>
                  <el-tag v-if="data.status === 0" type="info" size="small">禁用</el-tag>
                </span>
                <span class="tree-actions">
                  <el-button link type="primary" size="small" @click.stop="handleAdd(data)">添加</el-button>
                  <el-button link type="primary" size="small" @click.stop="handleEdit(data)">编辑</el-button>
                  <el-button link type="danger" size="small" @click.stop="handleDelete(data)">删除</el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ editMode ? '编辑分类' : '添加分类' }}</span>
            </div>
          </template>

          <el-form v-if="formVisible" :model="formData" label-width="100px" class="category-form">
            <el-form-item label="上级分类">
              <el-cascader
                v-model="formData.parentId"
                :options="parentOptions"
                :props="{ value: 'id', label: 'categoryName', children: 'children', checkStrictly: true, emitPath: false }"
                clearable
                placeholder="选择上级分类（不选则为顶级分类）"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="分类名称">
              <el-input v-model="formData.categoryName" placeholder="请输入分类名称" />
            </el-form-item>
            <el-form-item label="分类图标">
              <div class="icon-selector">
                <el-input v-model="formData.icon" placeholder="图标或emoji" style="width: 100px" />
                <div class="icon-preview" v-if="formData.icon">{{ formData.icon }}</div>
              </div>
            </el-form-item>
            <el-form-item label="分类图片">
              <el-upload action="#" :show-file-list="false">
                <el-image v-if="formData.image" :src="formData.image" style="width: 100px; height: 100px" fit="cover" />
                <div v-else class="upload-placeholder">
                  <el-icon><Plus /></el-icon>
                  <span>上传图片</span>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="formData.sort" :min="0" :max="999" />
              <span class="form-hint">数字越小越靠前</span>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
            </el-form-item>
            <el-form-item label="显示在导航">
              <el-switch v-model="formData.showInNav" />
            </el-form-item>
            <el-form-item label="分类描述">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
            </el-form-item>

            <el-divider>SEO设置</el-divider>

            <el-form-item label="SEO标题">
              <el-input v-model="formData.seoTitle" placeholder="SEO标题" />
            </el-form-item>
            <el-form-item label="SEO关键词">
              <el-input v-model="formData.seoKeywords" placeholder="SEO关键词，多个用逗号分隔" />
            </el-form-item>
            <el-form-item label="SEO描述">
              <el-input v-model="formData.seoDescription" type="textarea" :rows="2" placeholder="SEO描述" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSave">保存</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>

          <el-empty v-else description="请选择分类进行编辑，或点击添加新分类" />
        </el-card>

        <!-- 分类商品统计 -->
        <el-card style="margin-top: 20px" v-if="currentCategory">
          <template #header>
            <div class="card-header">
              <span>{{ currentCategory.categoryName }} - 商品统计</span>
              <el-button link type="primary">查看商品</el-button>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ currentCategory.productCount || 0 }}</div>
                <div class="stat-label">商品数量</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ currentCategory.skuCount || 0 }}</div>
                <div class="stat-label">SKU数量</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ currentCategory.onSaleCount || 0 }}</div>
                <div class="stat-label">在售商品</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">¥{{ formatMoney(currentCategory.salesAmount || 0) }}</div>
                <div class="stat-label">月销售额</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const categoryStats = ref({
  total: 45,
  active: 38
})

const treeData = ref([
  {
    id: 1, categoryName: '女装', icon: '👗', status: 1,
    children: [
      { id: 11, categoryName: '连衣裙', icon: '👗', status: 1, productCount: 234, skuCount: 890, onSaleCount: 189, salesAmount: 123456 },
      { id: 12, categoryName: 'T恤', icon: '👕', status: 1, productCount: 156, skuCount: 623, onSaleCount: 145, salesAmount: 89567 },
      { id: 13, categoryName: '衬衫', icon: '👔', status: 1, productCount: 89, skuCount: 356, onSaleCount: 78, salesAmount: 56789 },
      { id: 14, categoryName: '裤子', icon: '👖', status: 1, productCount: 123, skuCount: 492, onSaleCount: 112, salesAmount: 78901 },
      { id: 15, categoryName: '外套', icon: '🧥', status: 1, productCount: 67, skuCount: 268, onSaleCount: 56, salesAmount: 45678 }
    ]
  },
  {
    id: 2, categoryName: '男装', icon: '👔', status: 1,
    children: [
      { id: 21, categoryName: 'T恤', icon: '👕', status: 1, productCount: 189, skuCount: 756, onSaleCount: 167, salesAmount: 98765 },
      { id: 22, categoryName: '衬衫', icon: '👔', status: 1, productCount: 145, skuCount: 580, onSaleCount: 134, salesAmount: 87654 },
      { id: 23, categoryName: '裤子', icon: '👖', status: 1, productCount: 98, skuCount: 392, onSaleCount: 89, salesAmount: 65432 },
      { id: 24, categoryName: '外套', icon: '🧥', status: 0, productCount: 45, skuCount: 180, onSaleCount: 0, salesAmount: 0 }
    ]
  },
  {
    id: 3, categoryName: '童装', icon: '🧒', status: 1,
    children: [
      { id: 31, categoryName: '男童', icon: '👦', status: 1, productCount: 78, skuCount: 312, onSaleCount: 72, salesAmount: 34567 },
      { id: 32, categoryName: '女童', icon: '👧', status: 1, productCount: 89, skuCount: 356, onSaleCount: 81, salesAmount: 38901 }
    ]
  },
  {
    id: 4, categoryName: '配饰', icon: '🎒', status: 1,
    children: [
      { id: 41, categoryName: '箱包', icon: '👜', status: 1, productCount: 56, skuCount: 224, onSaleCount: 51, salesAmount: 45678 },
      { id: 42, categoryName: '鞋履', icon: '👟', status: 1, productCount: 123, skuCount: 492, onSaleCount: 112, salesAmount: 98765 },
      { id: 43, categoryName: '帽子', icon: '🧢', status: 1, productCount: 34, skuCount: 136, onSaleCount: 31, salesAmount: 12345 },
      { id: 44, categoryName: '围巾', icon: '🧣', status: 0, productCount: 23, skuCount: 92, onSaleCount: 0, salesAmount: 0 }
    ]
  }
])

const currentCategory = ref<any>(null)
const editMode = ref(false)
const formVisible = ref(false)

const formData = reactive({
  id: 0,
  parentId: null as number | null,
  categoryName: '',
  icon: '',
  image: '',
  sort: 0,
  status: 1,
  showInNav: true,
  description: '',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: ''
})

const parentOptions = computed(() => {
  const options = [{ id: 0, categoryName: '顶级分类', children: [] as any[] }]
  treeData.value.forEach(item => {
    options[0].children.push({ ...item, children: undefined })
  })
  return options
})

const formatMoney = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return num.toLocaleString()
}

const handleNodeClick = (data: any) => {
  currentCategory.value = data
  editMode.value = true
  formVisible.value = true
  Object.assign(formData, data)
}

const handleAddRoot = () => {
  currentCategory.value = null
  editMode.value = false
  formVisible.value = true
  Object.assign(formData, { id: 0, parentId: null, categoryName: '', icon: '', image: '', sort: 0, status: 1, showInNav: true, description: '', seoTitle: '', seoKeywords: '', seoDescription: '' })
}

const handleAdd = (data: any) => {
  currentCategory.value = null
  editMode.value = false
  formVisible.value = true
  Object.assign(formData, { id: 0, parentId: data.id, categoryName: '', icon: '', image: '', sort: 0, status: 1, showInNav: true, description: '', seoTitle: '', seoKeywords: '', seoDescription: '' })
}

const handleEdit = (data: any) => {
  currentCategory.value = data
  editMode.value = true
  formVisible.value = true
  Object.assign(formData, data)
}

const handleDelete = (data: any) => {
  ElMessageBox.confirm(`确定删除分类"${data.categoryName}"吗？删除后不可恢复。`, '提示', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleSave = () => {
  ElMessage.success(editMode.value ? '分类已更新' : '分类已创建')
  formVisible.value = false
}

const handleCancel = () => {
  formVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-stats {
  display: flex;
  gap: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #606266;
}

.category-stats b {
  color: #409EFF;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-icon {
  font-size: 16px;
}

.tree-actions {
  display: none;
}

.custom-tree-node:hover .tree-actions {
  display: inline;
}

.category-form {
  max-width: 500px;
}

.icon-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-preview {
  font-size: 24px;
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.upload-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

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
</style>