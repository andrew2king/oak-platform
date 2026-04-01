<template>
  <div class="member-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="user-card">
          <div class="user-info">
            <el-avatar :size="80" :src="authStore.user?.avatar" />
            <h3>{{ authStore.user?.nickname }}</h3>
            <el-tag type="warning">{{ authStore.user?.level }}</el-tag>
          </div>
          <el-divider />
          <div class="user-stats">
            <div class="stat-item">
              <span class="value">{{ authStore.user?.points }}</span>
              <span class="label">积分</span>
            </div>
            <div class="stat-item">
              <span class="value">¥{{ authStore.user?.balance }}</span>
              <span class="label">余额</span>
            </div>
            <div class="stat-item">
              <span class="value">{{ authStore.user?.coupons }}</span>
              <span class="label">优惠券</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <el-menu mode="horizontal" :default-active="activeMenu" @select="activeMenu = $event">
            <el-menu-item index="orders">我的订单</el-menu-item>
            <el-menu-item index="addresses">收货地址</el-menu-item>
            <el-menu-item index="coupons">优惠券</el-menu-item>
            <el-menu-item index="points">积分明细</el-menu-item>
            <el-menu-item index="profile">个人资料</el-menu-item>
            <el-menu-item index="security">安全设置</el-menu-item>
          </el-menu>

          <div class="menu-content">
            <!-- 我的订单 -->
            <template v-if="activeMenu === 'orders'">
              <el-empty description="暂无订单" />
            </template>

            <!-- 收货地址 -->
            <template v-else-if="activeMenu === 'addresses'">
              <el-empty description="暂无收货地址">
                <el-button type="primary">添加地址</el-button>
              </el-empty>
            </template>

            <!-- 优惠券 -->
            <template v-else-if="activeMenu === 'coupons'">
              <el-empty description="暂无优惠券" />
            </template>

            <!-- 积分明细 -->
            <template v-else-if="activeMenu === 'points'">
              <el-empty description="暂无积分记录" />
            </template>

            <!-- 个人资料 -->
            <template v-else-if="activeMenu === 'profile'">
              <el-form ref="profileFormRef" :model="profileForm" label-width="100px" style="max-width: 500px; margin-top: 20px;">
                <el-form-item label="头像">
                  <el-avatar :size="60" :src="profileForm.avatar" />
                </el-form-item>
                <el-form-item label="用户名">
                  <el-input :value="authStore.user?.username" disabled />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="profileForm.nickname" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="authStore.loading" @click="handleUpdateProfile">保存修改</el-button>
                </el-form-item>
              </el-form>
            </template>

            <!-- 安全设置 -->
            <template v-else-if="activeMenu === 'security'">
              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" style="max-width: 500px; margin-top: 20px;">
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="authStore.loading" @click="handleChangePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </template>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const activeMenu = ref('orders')

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const profileForm = reactive({
  nickname: '',
  phone: '',
  email: '',
  avatar: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 初始化表单数据
onMounted(() => {
  if (authStore.user) {
    profileForm.nickname = authStore.user.nickname
    profileForm.phone = authStore.user.phone
    profileForm.email = authStore.user.email
    profileForm.avatar = authStore.user.avatar
  }
})

// 监听用户变化
watch(() => authStore.user, (user) => {
  if (user) {
    profileForm.nickname = user.nickname
    profileForm.phone = user.phone
    profileForm.email = user.email
    profileForm.avatar = user.avatar
  }
})

const handleUpdateProfile = async () => {
  const success = await authStore.updateProfile({
    nickname: profileForm.nickname,
    phone: profileForm.phone,
    email: profileForm.email
  })
  if (success) {
    ElMessage.success('资料更新成功')
  } else {
    ElMessage.error('更新失败')
  }
}

const handleChangePassword = async () => {
  const valid = await passwordFormRef.value?.validate()
  if (!valid) return

  const success = await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
  if (success) {
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } else {
    ElMessage.error(authStore.error || '密码修改失败')
  }
}
</script>

<style scoped>
.member-page { padding: 20px 0; }
.user-card { text-align: center; }
.user-info { padding: 20px 0; }
.user-info h3 { margin: 12px 0 8px; font-size: 18px; }
.user-stats { display: flex; justify-content: space-around; padding: 10px 0; }
.stat-item { text-align: center; }
.stat-item .value { display: block; font-size: 20px; font-weight: bold; color: #303133; }
.stat-item .label { font-size: 12px; color: #909399; margin-top: 4px; }
.menu-content { padding: 20px; min-height: 300px; }
</style>