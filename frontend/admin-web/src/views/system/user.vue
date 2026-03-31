<template>
  <div class="system-user">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="请输入" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table :data="userList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :src="row.avatar" :size="40">{{ row.nickname?.charAt(0) }}</el-avatar>
              <div class="user-info">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-meta">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" size="small" class="role-tag">{{ role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="部门" width="120">
          <template #default="{ row }">
            <span>{{ row.department }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="userVisible" :title="editUser ? '编辑用户' : '新增用户'" width="500px">
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="!!editUser" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.roles" multiple style="width: 100%">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="运营管理" value="运营管理" />
            <el-option label="商品管理" value="商品管理" />
            <el-option label="客服" value="客服" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-cascader v-model="userForm.departmentId" :options="departments" :props="{ value: 'id', label: 'name' }" style="width: 100%" />
        </el-form-item>
        <el-form-item label="密码" v-if="!editUser">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const userVisible = ref(false)
const editUser = ref<any>(null)

const queryParams = reactive({
  username: '',
  phone: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const userForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  roles: [],
  departmentId: [],
  password: ''
})

const departments = ref([
  { id: 1, name: '总部', children: [
    { id: 11, name: '运营部' },
    { id: 12, name: '技术部' },
    { id: 13, name: '市场部' }
  ]}
])

const userList = ref([
  { id: 1, username: 'admin', nickname: '超级管理员', avatar: 'https://picsum.photos/40/40?random=1101', phone: '13800138001', email: 'admin@oak.com', roles: ['超级管理员'], department: '总部', status: 1, lastLoginTime: '2026-03-30 10:30' },
  { id: 2, username: 'operator1', nickname: '张运营', avatar: 'https://picsum.photos/40/40?random=1102', phone: '13800138002', email: 'zhang@oak.com', roles: ['运营管理'], department: '运营部', status: 1, lastLoginTime: '2026-03-30 09:45' },
  { id: 3, username: 'operator2', nickname: '李运营', avatar: 'https://picsum.photos/40/40?random=1103', phone: '13800138003', email: 'li@oak.com', roles: ['运营管理', '商品管理'], department: '运营部', status: 1, lastLoginTime: '2026-03-29 16:20' },
  { id: 4, username: 'service1', nickname: '王客服', avatar: 'https://picsum.photos/40/40?random=1104', phone: '13800138004', email: 'wang@oak.com', roles: ['客服'], department: '运营部', status: 1, lastLoginTime: '2026-03-30 08:00' },
  { id: 5, username: 'product1', nickname: '赵商品', avatar: 'https://picsum.photos/40/40?random=1105', phone: '13800138005', email: 'zhao@oak.com', roles: ['商品管理'], department: '运营部', status: 1, lastLoginTime: '2026-03-28 14:30' },
  { id: 6, username: 'tech1', nickname: '孙技术', avatar: 'https://picsum.photos/40/40?random=1106', phone: '13800138006', email: 'sun@oak.com', roles: ['超级管理员'], department: '技术部', status: 1, lastLoginTime: '2026-03-30 11:00' },
  { id: 7, username: 'market1', nickname: '周市场', avatar: 'https://picsum.photos/40/40?random=1107', phone: '13800138007', email: 'zhou@oak.com', roles: ['运营管理'], department: '市场部', status: 0, lastLoginTime: '2026-03-20 09:00' },
  { id: 8, username: 'service2', nickname: '吴客服', avatar: 'https://picsum.photos/40/40?random=1108', phone: '13800138008', email: 'wu@oak.com', roles: ['客服'], department: '运营部', status: 1, lastLoginTime: '2026-03-30 10:15' }
])

onMounted(() => {
  total.value = userList.value.length
})

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  queryParams.username = ''
  queryParams.phone = ''
  queryParams.status = ''
}

const handleAdd = () => {
  editUser.value = null
  Object.assign(userForm, { username: '', nickname: '', phone: '', email: '', roles: [], departmentId: [], password: '' })
  userVisible.value = true
}

const handleEdit = (row: any) => {
  editUser.value = row
  Object.assign(userForm, row)
  userVisible.value = true
}

const handleResetPwd = (row: any) => {
  ElMessageBox.confirm('确定重置该用户的密码吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('密码已重置为: 123456')
    })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('用户已删除')
    })
}

const handleStatusChange = (row: any) => {
  ElMessage.success(row.status ? '用户已启用' : '用户已禁用')
}

const saveUser = () => {
  ElMessage.success(editUser.value ? '用户已更新' : '用户已创建')
  userVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 16px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.user-meta {
  font-size: 12px;
  color: #909399;
}

.role-tag {
  margin-right: 4px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>