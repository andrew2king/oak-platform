<template>
  <div class="system-role">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <!-- 角色列表 -->
      <el-table :data="roleList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="用户数" width="100" align="center">
          <template #default="{ row }">
            <el-tag>{{ row.userCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handlePermission(row)">权限</el-button>
            <el-button link type="danger" :disabled="row.code === 'admin'" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog v-model="roleVisible" :title="editRole ? '编辑角色' : '新增角色'" width="500px">
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" :disabled="!!editRole" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog v-model="permVisible" title="权限配置" width="600px">
      <el-tree
        ref="permTree"
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPerms"
        default-expand-all
      />
      <template #footer>
        <el-button @click="permVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const roleVisible = ref(false)
const permVisible = ref(false)
const editRole = ref<any>(null)
const permTree = ref()

const roleForm = reactive({
  name: '',
  code: '',
  description: ''
})

const checkedPerms = ref<number[]>([])

const roleList = ref([
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', userCount: 3, status: 1, createTime: '2026-01-01 00:00' },
  { id: 2, name: '运营管理', code: 'operator', description: '负责日常运营管理，包括商品、订单、会员等', userCount: 12, status: 1, createTime: '2026-01-15 10:30' },
  { id: 3, name: '商品管理', code: 'product', description: '负责商品上下架、库存管理', userCount: 8, status: 1, createTime: '2026-02-01 14:00' },
  { id: 4, name: '客服', code: 'service', description: '处理客户咨询、投诉、售后', userCount: 15, status: 1, createTime: '2026-02-15 09:00' },
  { id: 5, name: '数据分析师', code: 'analyst', description: '查看和分析业务数据', userCount: 5, status: 1, createTime: '2026-03-01 11:00' },
  { id: 6, name: '财务管理', code: 'finance', description: '管理财务、结算、发票', userCount: 4, status: 1, createTime: '2026-03-10 16:30' }
])

const permissionTree = ref([
  {
    id: 1, name: '仪表盘', children: [
      { id: 11, name: '查看' }
    ]
  },
  {
    id: 2, name: '商品管理', children: [
      { id: 21, name: '商品列表' },
      { id: 22, name: '新增商品' },
      { id: 23, name: '编辑商品' },
      { id: 24, name: '删除商品' },
      { id: 25, name: '分类管理' },
      { id: 26, name: '品牌管理' }
    ]
  },
  {
    id: 3, name: '订单管理', children: [
      { id: 31, name: '订单列表' },
      { id: 32, name: '订单详情' },
      { id: 33, name: '发货处理' },
      { id: 34, name: '退款处理' }
    ]
  },
  {
    id: 4, name: '会员管理', children: [
      { id: 41, name: '会员列表' },
      { id: 42, name: '等级管理' },
      { id: 43, name: '积分管理' },
      { id: 44, name: '标签管理' }
    ]
  },
  {
    id: 5, name: '营销管理', children: [
      { id: 51, name: '活动管理' },
      { id: 52, name: '优惠券管理' },
      { id: 53, name: '秒杀管理' },
      { id: 54, name: '拼团管理' }
    ]
  },
  {
    id: 6, name: '数据分析', children: [
      { id: 61, name: '销售分析' },
      { id: 62, name: '商品分析' },
      { id: 63, name: '会员分析' }
    ]
  },
  {
    id: 7, name: '系统设置', children: [
      { id: 71, name: '用户管理' },
      { id: 72, name: '角色管理' },
      { id: 73, name: '门店管理' },
      { id: 74, name: '系统配置' }
    ]
  }
])

const handleAdd = () => {
  editRole.value = null
  Object.assign(roleForm, { name: '', code: '', description: '' })
  roleVisible.value = true
}

const handleEdit = (row: any) => {
  editRole.value = row
  Object.assign(roleForm, row)
  roleVisible.value = true
}

const handlePermission = (row: any) => {
  checkedPerms.value = [11, 21, 22, 31, 41]
  permVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该角色吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('角色已删除')
    })
}

const handleStatusChange = (row: any) => {
  ElMessage.success(row.status ? '角色已启用' : '角色已禁用')
}

const saveRole = () => {
  ElMessage.success(editRole.value ? '角色已更新' : '角色已创建')
  roleVisible.value = false
}

const savePermission = () => {
  ElMessage.success('权限已保存')
  permVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>