<template>
  <div class="member-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="user-card">
          <div class="user-info">
            <el-avatar :size="80" src="https://picsum.photos/80/80?random=user" />
            <h3>张三</h3>
            <el-tag type="warning">金卡会员</el-tag>
          </div>
          <el-divider />
          <div class="user-stats">
            <div class="stat-item">
              <span class="value">2560</span>
              <span class="label">积分</span>
            </div>
            <div class="stat-item">
              <span class="value">¥500</span>
              <span class="label">余额</span>
            </div>
            <div class="stat-item">
              <span class="value">3</span>
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
          </el-menu>

          <div class="menu-content">
            <template v-if="activeMenu === 'orders'">
              <el-empty description="暂无订单" />
            </template>
            <template v-else-if="activeMenu === 'addresses'">
              <el-empty description="暂无收货地址" />
            </template>
            <template v-else-if="activeMenu === 'coupons'">
              <el-empty description="暂无优惠券" />
            </template>
            <template v-else-if="activeMenu === 'points'">
              <el-empty description="暂无积分记录" />
            </template>
            <template v-else>
              <el-form label-width="100px" style="max-width: 500px; margin-top: 20px;">
                <el-form-item label="昵称">
                  <el-input value="张三" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input value="138****8888" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input value="zhang@example.com" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary">保存修改</el-button>
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
import { ref } from 'vue'

const activeMenu = ref('orders')
</script>

<style scoped>
.user-card { text-align: center; }
.user-info { padding: 20px 0; }
.user-info h3 { margin: 12px 0 8px; font-size: 18px; }
.user-stats { display: flex; justify-content: space-around; padding: 10px 0; }
.stat-item { text-align: center; }
.stat-item .value { display: block; font-size: 20px; font-weight: bold; color: #303133; }
.stat-item .label { font-size: 12px; color: #909399; margin-top: 4px; }
.menu-content { padding: 20px; min-height: 300px; }
</style>