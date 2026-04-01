<template>
  <div class="forgot-page">
    <div class="forgot-container">
      <div class="forgot-header">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-icon">🌳</span>
          <span class="logo-text">Oak商城</span>
        </div>
        <h2>找回密码</h2>
        <p class="subtitle">输入注册邮箱，我们将发送验证码</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="forgot-form">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="注册邮箱" prefix-icon="Message" size="large" />
        </el-form-item>

        <template v-if="step === 1">
          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" @click="handleSendCode" class="forgot-btn">
              发送验证码
            </el-button>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item prop="code">
            <el-input v-model="form.code" placeholder="验证码（Mock任意6位数字）" prefix-icon="Key" size="large" maxlength="6" />
          </el-form-item>
          <el-form-item prop="newPassword">
            <el-input v-model="form.newPassword" type="password" placeholder="新密码" prefix-icon="Lock" size="large" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" @click="handleReset" class="forgot-btn">
              重置密码
            </el-button>
          </el-form-item>
        </template>

        <div class="forgot-footer">
          <el-link type="primary" @click="$router.push('/login')">返回登录</el-link>
        </div>
      </el-form>

      <el-divider>提示</el-divider>
      <div class="hint">
        <el-text type="info" size="small">
          Mock模式下，验证码可输入任意6位数字。实际邮箱: zhang@example.com
        </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const step = ref(1)
const loading = ref(false)

const form = reactive({
  email: '',
  code: '',
  newPassword: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20个字符', trigger: 'blur' }
  ]
}

const handleSendCode = async () => {
  const valid = await formRef.value?.validateField('email')
  if (!valid) return

  loading.value = true
  const success = await authStore.sendResetCode(form.email)
  loading.value = false

  if (success) {
    ElMessage.success('验证码已发送（Mock模式下请输入任意6位数字）')
    step.value = 2
  } else {
    ElMessage.error(authStore.error || '发送失败')
  }
}

const handleReset = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  const success = await authStore.resetPassword(form.email, form.newPassword)
  loading.value = false

  if (success) {
    ElMessage.success('密码重置成功')
    router.push('/login')
  } else {
    ElMessage.error('重置失败')
  }
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-container {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.forgot-header {
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

.forgot-header h2 { color: #303133; font-size: 18px; margin-bottom: 8px; }
.subtitle { color: #909399; font-size: 14px; }

.forgot-form { margin-top: 20px; }
.forgot-btn { width: 100%; }

.forgot-footer {
  text-align: center;
  margin-top: 16px;
}

.hint { text-align: center; }
</style>