import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户类型定义
export interface User {
  id: string
  username: string
  password: string
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

// localStorage key - 与shop-web共享
const STORAGE_KEY = 'oak_auth_data'
const TOKEN_KEY = 'oak_auth_token'

// 初始化Mock用户数据（与shop-web共享）
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
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const loading = ref(false)
  const error = ref<string>('')

  const mockUsers = ref<User[]>(initMockUsers())

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function init() {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem('oak_current_user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = ''

    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = mockUsers.value.find(
      u => u.username === username && u.password === password
    )

    if (foundUser) {
      user.value = { ...foundUser }
      token.value = `mock_token_${foundUser.id}_${Date.now()}`

      localStorage.setItem(TOKEN_KEY, token.value)
      localStorage.setItem('oak_current_user', JSON.stringify(foundUser))

      loading.value = false
      return true
    }

    error.value = '用户名或密码错误'
    loading.value = false
    return false
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('oak_current_user')
  }

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
    logout
  }
})