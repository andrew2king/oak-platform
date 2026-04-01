<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-icon">🌳</span>
          <span class="logo-text">Oak商城</span>
        </div>
        <h2>用户登录</h2>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <div class="form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" @click="$router.push('/forgot-password')">忘记密码?</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="authStore.loading" @click="handleLogin" class="login-btn">
            登录
          </el-button>
        </el-form-item>
        <div class="login-footer">
          <span>还没有账号?</span>
          <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
        </div>
      </el-form>

      <el-divider>测试账号</el-divider>
      <div class="test-accounts">
        <el-tag type="info" size="small">会员: user / user123</el-tag>
        <el-tag type="warning" size="small">管理员: admin / admin123</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const rememberMe = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const success = await authStore.login(form.username, form.password)
  if (success) {
    ElMessage.success('登录成功')
    // 跳转到来源页或首页
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } else {
    ElMessage.error(authStore.error || '登录失败')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 16px;
}

.logo-icon { font-size: 32px; }
.logo-text { font-size: 22px; font-weight: bold; color: #409EFF; }

.login-header h2 { color: #303133; font-size: 18px; }

.login-form { margin-top: 20px; }

.form-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.login-btn { width: 100%; }

.login-footer {
  text-align: center;
  color: #909399;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.test-accounts {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
</style>