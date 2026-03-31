<template>
  <div class="shop-app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-icon">🌳</span>
          <span class="logo-text">Oak商城</span>
        </div>
        <div class="search-box">
          <el-input v-model="searchText" placeholder="搜索商品" class="search-input">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <el-badge :value="3" class="cart-badge">
            <el-button :icon="ShoppingCart" circle @click="$router.push('/cart')" />
          </el-badge>
          <el-dropdown>
            <el-button :icon="User" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/member')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/orders')">我的订单</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!-- 分类导航 -->
      <nav class="nav-bar">
        <div class="nav-content">
          <span class="nav-item" @click="goToCategory()">全部商品</span>
          <el-dropdown v-for="cat in categories" :key="cat.id" trigger="hover">
            <span class="nav-item">{{ cat.icon }} {{ cat.name }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToCategory(cat.id as number)">{{ cat.name }}全部</el-dropdown-item>
                <el-dropdown-item v-for="sub in cat.children" :key="sub.id" @click="goToCategory(sub.id as number)">
                  {{ sub.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </nav>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <div class="link-group">
            <h4>购物指南</h4>
            <a href="#">购物流程</a>
            <a href="#">会员介绍</a>
            <a href="#">积分规则</a>
          </div>
          <div class="link-group">
            <h4>配送方式</h4>
            <a href="#">配送范围</a>
            <a href="#">配送费用</a>
            <a href="#">自提服务</a>
          </div>
          <div class="link-group">
            <h4>售后服务</h4>
            <a href="#">退换货政策</a>
            <a href="#">退款说明</a>
            <a href="#">联系客服</a>
          </div>
          <div class="link-group">
            <h4>关于我们</h4>
            <a href="#">公司简介</a>
            <a href="#">门店查询</a>
            <a href="#">联系我们</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 Oak Platform 新零售平台 - 让购物更简单</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingCart, User } from '@element-plus/icons-vue'
import { productAPI, type Category } from '@/api/product'

const router = useRouter()
const searchText = ref('')
const categories = ref<Category[]>([])

const handleSearch = () => {
  if (searchText.value.trim()) {
    router.push({ path: '/search', query: { q: searchText.value } })
  }
}

const goToCategory = (catId?: number) => {
  router.push({ path: '/category', query: catId ? { category: catId } : {} })
}

onMounted(async () => {
  categories.value = await productAPI.getCategories()
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

.shop-app { min-height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }

/* Header */
.header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
.header-content { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 40px; }
.logo { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.logo-icon { font-size: 32px; }
.logo-text { font-size: 22px; font-weight: bold; color: #409EFF; }
.search-box { flex: 1; max-width: 500px; }
.search-input { width: 100%; }
.header-actions { display: flex; gap: 12px; }

/* Nav */
.nav-bar { background: #409EFF; }
.nav-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; gap: 30px; }
.nav-item { color: #fff; padding: 12px 0; cursor: pointer; font-size: 15px; }
.nav-item:hover { opacity: 0.8; }

/* Main */
.main-content { flex: 1; max-width: 1200px; margin: 0 auto; padding: 20px; width: 100%; }

/* Footer */
.footer { background: #2c3e50; color: #fff; margin-top: auto; }
.footer-content { max-width: 1200px; margin: 0 auto; padding: 40px 20px 20px; }
.footer-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
.link-group h4 { margin-bottom: 16px; font-size: 16px; }
.link-group a { display: block; color: #bdc3c7; text-decoration: none; margin-bottom: 10px; font-size: 14px; }
.link-group a:hover { color: #fff; }
.footer-bottom { margin-top: 30px; padding-top: 20px; border-top: 1px solid #34495e; text-align: center; color: #7f8c8d; font-size: 13px; }
</style>