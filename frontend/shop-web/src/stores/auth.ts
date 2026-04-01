import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户类型定义
export interface User {
  id: string
  username: string
  password: string  // 仅Mock使用，生产环境不应存储
  nickname: string
  phone: string
  email: string
  avatar: string
  role: 'admin' | 'member'
  level: string
  points: number
  balance: number
  coupons: number
  createdAt: string
}

// localStorage key
const STORAGE_KEY = 'oak_auth_data'
const TOKEN_KEY = 'oak_auth_token'

// 初始化Mock用户数据
function initMockUsers(): User[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }

  // 默认测试用户
  const defaultUsers: User[] = [
    {
      id: 'admin-001',
      username: 'admin',
      password: 'admin123',
      nickname: '管理员',
      phone: '138****0001',
      email: 'admin@oak.com',
      avatar: 'https://picsum.photos/80/80?random=admin',
      role: 'admin',
      level: '管理员',
      points: 0,
      balance: 0,
      coupons: 0,
      createdAt: '2026-01-01'
    },
    {
      id: 'user-001',
      username: 'user',
      password: 'user123',
      nickname: '张三',
      phone: '138****8888',
      email: 'zhang@example.com',
      avatar: 'https://picsum.photos/80/80?random=user',
      role: 'member',
      level: '金卡会员',
      points: 2560,
      balance: 500,
      coupons: 3,
      createdAt: '2026-01-15'
    }
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers))
  return defaultUsers
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const loading = ref(false)
  const error = ref<string>('')

  // 初始化Mock用户
  const mockUsers = ref<User[]>(initMockUsers())

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 初始化 - 从localStorage恢复登录状态
  function init() {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem('oak_current_user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  // 登录
  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = ''

    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = mockUsers.value.find(
      u => u.username === username && u.password === password
    )

    if (foundUser) {
      user.value = { ...foundUser }
      token.value = `mock_token_${foundUser.id}_${Date.now()}`

      // 持久化
      localStorage.setItem(TOKEN_KEY, token.value)
      localStorage.setItem('oak_current_user', JSON.stringify(foundUser))

      loading.value = false
      return true
    }

    error.value = '用户名或密码错误'
    loading.value = false
    return false
  }

  // 注册
  async function register(data: {
    username: string
    password: string
    nickname: string
    phone: string
    email: string
  }): Promise<boolean> {
    loading.value = true
    error.value = ''

    await new Promise(resolve => setTimeout(resolve, 500))

    // 检查用户名是否已存在
    if (mockUsers.value.some(u => u.username === data.username)) {
      error.value = '用户名已存在'
      loading.value = false
      return false
    }

    // 创建新用户
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: data.username,
      password: data.password,
      nickname: data.nickname || data.username,
      phone: data.phone,
      email: data.email,
      avatar: `https://picsum.photos/80/80?random=${Date.now()}`,
      role: 'member',
      level: '普通会员',
      points: 0,
      balance: 0,
      coupons: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }

    // 保存到Mock用户列表
    mockUsers.value.push(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers.value))

    // 自动登录
    user.value = { ...newUser }
    token.value = `mock_token_${newUser.id}_${Date.now()}`
    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem('oak_current_user', JSON.stringify(newUser))

    loading.value = false
    return true
  }

  // 登出
  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('oak_current_user')
  }

  // 更新个人信息
  async function updateProfile(data: Partial<User>): Promise<boolean> {
    if (!user.value) return false

    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    // 更新用户信息
    const updatedUser = { ...user.value, ...data }
    user.value = updatedUser

    // 更新Mock用户列表
    const index = mockUsers.value.findIndex(u => u.id === updatedUser.id)
    if (index >= 0) {
      mockUsers.value[index] = updatedUser
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers.value))
    }

    // 更新localStorage中的当前用户
    localStorage.setItem('oak_current_user', JSON.stringify(updatedUser))

    loading.value = false
    return true
  }

  // 修改密码
  async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (!user.value) return false

    loading.value = true
    error.value = ''

    await new Promise(resolve => setTimeout(resolve, 300))

    // 验证旧密码
    const currentUser = mockUsers.value.find(u => u.id === user.value!.id)
    if (!currentUser || currentUser.password !== oldPassword) {
      error.value = '原密码错误'
      loading.value = false
      return false
    }

    // 更新密码
    currentUser.password = newPassword
    user.value = { ...currentUser }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers.value))
    localStorage.setItem('oak_current_user', JSON.stringify(currentUser))

    loading.value = false
    return true
  }

  // 找回密码（模拟发送验证码）
  async function sendResetCode(email: string): Promise<boolean> {
    loading.value = true
    error.value = ''

    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = mockUsers.value.find(u => u.email === email)
    if (!foundUser) {
      error.value = '邮箱未注册'
      loading.value = false
      return false
    }

    // Mock: 返回成功，实际不发送邮件
    loading.value = false
    return true
  }

  // 重置密码
  async function resetPassword(email: string, newPassword: string): Promise<boolean> {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = mockUsers.value.find(u => u.email === email)
    if (foundUser) {
      foundUser.password = newPassword
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers.value))
    }

    loading.value = false
    return true
  }

  // 初始化
  init()

  return {
    user,
    token,
    loading,
    error,
    mockUsers,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    sendResetCode,
    resetPassword
  }
})