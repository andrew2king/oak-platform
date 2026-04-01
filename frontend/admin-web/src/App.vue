<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🌳</span>
        <span v-show="!isCollapse" class="logo-text">Oak Platform</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        :collapse="isCollapse"
        background-color="#1d1e1f"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-sub-menu index="product">
          <template #title>
            <el-icon><ShoppingBag /></el-icon>
            <span>商品中心</span>
          </template>
          <el-menu-item index="/product/list">商品管理</el-menu-item>
          <el-menu-item index="/product/category">分类管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="order">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>订单中心</span>
          </template>
          <el-menu-item index="/order/list">全部订单</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="inventory">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory/list">库存查询</el-menu-item>
          <el-menu-item index="/inventory/warning">库存预警</el-menu-item>
          <el-menu-item index="/inventory/transfer">库存调拨</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="member">
          <template #title>
            <el-icon><User /></el-icon>
            <span>会员中心</span>
          </template>
          <el-menu-item index="/member/list">会员列表</el-menu-item>
          <el-menu-item index="/member/level">等级管理</el-menu-item>
          <el-menu-item index="/member/points">积分管理</el-menu-item>
          <el-menu-item index="/member/tags">标签管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="marketing">
          <template #title>
            <el-icon><Present /></el-icon>
            <span>营销中心</span>
          </template>
          <el-menu-item index="/marketing/activity">活动管理</el-menu-item>
          <el-menu-item index="/marketing/coupon">优惠券</el-menu-item>
          <el-menu-item index="/marketing/seckill">限时秒杀</el-menu-item>
          <el-menu-item index="/marketing/groupbuy">拼团活动</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="analysis">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>数据分析</span>
          </template>
          <el-menu-item index="/analysis/sales">销售分析</el-menu-item>
          <el-menu-item index="/analysis/product">商品分析</el-menu-item>
          <el-menu-item index="/analysis/member">会员分析</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/role">角色权限</el-menu-item>
          <el-menu-item index="/system/store">门店管理</el-menu-item>
          <el-menu-item index="/system/config">系统配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主体区域 -->
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="12" class="badge-item">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="authStore.user?.avatar">A</el-avatar>
              <span>{{ authStore.user?.nickname || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataBoard, ShoppingBag, Document, Box, User, Present,
  TrendCharts, Setting, Fold, Expand, Bell
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title as string)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

.layout-container { height: 100vh; }

.sidebar {
  background-color: #1d1e1f;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #2d2e2f;
}

.logo-icon { font-size: 24px; }
.logo-text { margin-left: 8px; }

.sidebar-menu {
  border-right: none !important;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) { width: 220px; }

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-left { display: flex; align-items: center; gap: 16px; }
.collapse-btn { font-size: 20px; cursor: pointer; color: #606266; }
.collapse-btn:hover { color: #409EFF; }

.header-right { display: flex; align-items: center; gap: 20px; }
.badge-item { cursor: pointer; }
.user-info { display: flex; align-items: center; cursor: pointer; gap: 8px; }

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>