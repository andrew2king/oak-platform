<template>
  <div class="home-page">
    <!-- 轮播Banner -->
    <section class="banner-section">
      <el-carousel height="420px" class="banner-carousel" indicator-position="outside">
        <el-carousel-item v-for="(item, index) in banners" :key="item.id">
          <div class="banner-item" :style="{ background: item.bg }">
            <div class="banner-pattern" :class="'pattern-' + (index + 1)"></div>
            <div class="banner-content">
              <div class="banner-tag">{{ item.tag }}</div>
              <h2 class="banner-title">{{ item.title }}</h2>
              <p class="banner-desc">{{ item.desc }}</p>
              <div class="banner-actions">
                <el-button type="primary" size="large" round class="banner-btn">
                  {{ item.btnText }}
                  <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="banner-decoration">
              <div class="deco-circle deco-1"></div>
              <div class="deco-circle deco-2"></div>
              <div class="deco-circle deco-3"></div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 活动入口 -->
    <section class="activity-section">
      <div
        v-for="act in activities"
        :key="act.id"
        class="activity-card"
        :style="{ background: act.bg }"
        @click="goToActivity(act.path)"
      >
        <div class="activity-icon">{{ act.icon }}</div>
        <div class="activity-content">
          <h3>{{ act.title }}</h3>
          <p>{{ act.desc }}</p>
        </div>
        <div class="activity-arrow">→</div>
      </div>
    </section>

    <!-- 分类导航 -->
    <section class="category-section">
      <div class="section-header">
        <h2><span class="section-icon">📦</span> 精选分类</h2>
        <el-button link type="primary" class="more-btn" @click="goToCategory">
          全部分类 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="category-scroll">
        <div
          v-for="cat in categoryList"
          :key="cat.id"
          class="category-card"
          :style="{ '--cat-color': cat.color }"
          @click="$router.push('/category?category=' + cat.id)"
        >
          <div class="category-icon-wrap" :style="{ background: cat.color }">
            <span class="category-icon">{{ cat.icon }}</span>
          </div>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>
    </section>

    <!-- 今日必抢 -->
    <section class="flash-sale-section">
      <div class="section-header">
        <h2><span class="section-icon">⚡</span> 今日必抢</h2>
        <div class="countdown-wrap">
          <span class="countdown-label">距结束</span>
          <span class="countdown-time">{{ countdown }}</span>
        </div>
      </div>
      <div class="product-scroll">
        <div
          v-for="product in flashProducts"
          :key="product.id"
          class="product-card flash-card"
          @click="$router.push('/product/' + product.id)"
        >
          <div class="flash-badge">限时特惠</div>
          <el-image :src="product.image" class="product-image" fit="cover">
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-meta">
              <span class="product-brand">{{ product.brandName }}</span>
              <span class="product-sales">已抢{{ product.sales }}件</span>
            </div>
            <div class="product-price">
              <span class="price">¥{{ product.price }}</span>
              <span class="original">¥{{ product.originalPrice }}</span>
              <span class="discount">{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%OFF</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新品首发 -->
    <section class="new-arrivals-section">
      <div class="section-header">
        <h2><span class="section-icon">✨</span> 新品首发</h2>
        <el-button link type="primary" class="more-btn" @click="goToCategory">
          发现更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="new-arrivals-grid">
        <div
          v-for="(product, index) in newProducts"
          :key="product.id"
          class="new-product-card"
          :class="{ 'large': index === 0 }"
          @click="$router.push('/product/' + product.id)"
        >
          <div class="new-badge">NEW</div>
          <el-image :src="product.image" class="product-image" fit="cover" />
          <div class="product-overlay">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price">
              <span class="price">¥{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 品牌精选 -->
    <section class="brand-section">
      <div class="section-header">
        <h2><span class="section-icon">🏷️</span> 品牌精选</h2>
      </div>
      <div class="brand-grid">
        <div
          v-for="brand in brands"
          :key="brand.id"
          class="brand-card"
          :style="{ background: brand.bg }"
        >
          <div class="brand-logo">{{ brand.logo }}</div>
          <div class="brand-name">{{ brand.name }}</div>
          <div class="brand-promo">{{ brand.promo }}</div>
        </div>
      </div>
    </section>

    <!-- 猜你喜欢 -->
    <section class="recommend-section">
      <div class="section-header">
        <h2><span class="section-icon">💡</span> 猜你喜欢</h2>
        <el-button link type="primary" class="refresh-btn" @click="refreshRecommend">
          <el-icon><Refresh /></el-icon>
          换一批
        </el-button>
      </div>
      <div class="waterfall-grid">
        <div
          v-for="product in recommendProducts"
          :key="product.id"
          class="waterfall-card"
          @click="$router.push('/product/' + product.id)"
        >
          <el-image :src="product.image" class="product-image" fit="cover" />
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-tags">
              <el-tag v-for="tag in product.tags?.slice(0, 2)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            </div>
            <div class="product-price">
              <span class="price">¥{{ product.price }}</span>
              <span class="product-sales">{{ product.sales }}人付款</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Picture, Refresh } from '@element-plus/icons-vue'
import { productAPI, type Product } from '@/api/product'

const router = useRouter()

// 轮播Banner数据
const banners = ref([
  {
    id: 1,
    tag: '春日焕新',
    title: '春季新品上市',
    desc: '全场新品低至8折，春日穿搭必备单品',
    btnText: '立即抢购',
    bg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
  },
  {
    id: 2,
    tag: '限时特惠',
    title: '超级秒杀日',
    desc: '每日10点准时开抢，爆款低至1折起',
    btnText: '前往秒杀',
    bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
  },
  {
    id: 3,
    tag: '品质生活',
    title: '品质生活节',
    desc: '精选好物，品质保障，满199减50',
    btnText: '逛一逛',
    bg: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)'
  },
  {
    id: 4,
    tag: '会员专享',
    title: '会员超级日',
    desc: '积分翻倍、专属折扣、更多会员权益等你解锁',
    btnText: '开通会员',
    bg: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)'
  }
])

// 活动入口
const activities = ref([
  { id: 1, icon: '⚡', title: '限时秒杀', desc: '整点开抢', bg: 'linear-gradient(135deg, #FF416C, #FF4B2B)', path: '/category' },
  { id: 2, icon: '🎁', title: '拼团购', desc: '多人更优惠', bg: 'linear-gradient(135deg, #FF8008, #FFC837)', path: '/category' },
  { id: 3, icon: '🎫', title: '领券中心', desc: '天天领红包', bg: 'linear-gradient(135deg, #00C9FF, #92FE9D)', path: '/member' },
  { id: 4, icon: '👑', title: '会员专享', desc: '专属特权', bg: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', path: '/member' }
])

// 分类列表
const categoryList = ref([
  { id: 1, name: '女装', icon: '👗', color: '#FF6B6B' },
  { id: 2, name: '男装', icon: '👔', color: '#4ECDC4' },
  { id: 3, name: '童装', icon: '🧒', color: '#FFE66D' },
  { id: 4, name: '数码', icon: '📱', color: '#95E1D3' },
  { id: 5, name: '家居', icon: '🏠', color: '#DDA0DD' },
  { id: 6, name: '美妆', icon: '💄', color: '#FF69B4' },
  { id: 7, name: '运动', icon: '⚽', color: '#87CEEB' },
  { id: 8, name: '食品', icon: '🍎', color: '#98FB98' }
])

// 品牌精选
const brands = ref([
  { id: 1, name: 'Oak自营', logo: '🌳', promo: '品质保障', bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' },
  { id: 2, name: 'NIKE', logo: '✓', promo: '全场8折', bg: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 3, name: 'UNIQLO', logo: '优', promo: '新品上市', bg: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
  { id: 4, name: 'ZARA', logo: 'Z', promo: '限时特惠', bg: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)' }
])

const flashProducts = ref<Product[]>([])
const newProducts = ref<Product[]>([])
const recommendProducts = ref<Product[]>([])
const countdown = ref('02:30:45')
let countdownTimer: number | null = null

const goToActivity = (path: string) => {
  router.push(path)
}

const goToCategory = () => {
  router.push('/category')
}

const refreshRecommend = async () => {
  recommendProducts.value = await productAPI.getRecommend(12)
}

const updateCountdown = () => {
  // 模拟倒计时
  let hours = 2, minutes = 30, seconds = 45
  countdownTimer = window.setInterval(() => {
    seconds--
    if (seconds < 0) {
      seconds = 59
      minutes--
      if (minutes < 0) {
        minutes = 59
        hours--
        if (hours < 0) {
          hours = 23
        }
      }
    }
    countdown.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, 1000)
}

onMounted(async () => {
  // 加载商品数据
  const products = await productAPI.getProducts({ pageSize: 20, sortBy: 'sales', sortOrder: 'desc' })
  flashProducts.value = products.list.slice(0, 6)
  newProducts.value = products.list.slice(6, 10)
  recommendProducts.value = await productAPI.getRecommend(12)

  updateCountdown()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.home-page {
  background: #F8F9FA;
  min-height: 100vh;
}

/* ========== Banner ========== */
.banner-section {
  margin-bottom: 20px;
}

.banner-carousel {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.banner-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.banner-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px);
  background-size: 30px 30px;
}

.banner-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.deco-1 { width: 200px; height: 200px; top: -50px; right: 10%; }
.deco-2 { width: 150px; height: 150px; bottom: -30px; right: 30%; }
.deco-3 { width: 100px; height: 100px; top: 20%; right: 20%; }

.banner-content {
  text-align: center;
  color: #fff;
  z-index: 1;
  padding: 20px;
}

.banner-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 16px;
}

.banner-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.banner-desc {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 24px;
}

.banner-btn {
  background: rgba(255, 255, 255, 0.95) !important;
  color: #FF6B6B !important;
  border: none !important;
  font-weight: 600;
  padding: 12px 32px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.banner-btn:hover {
  background: #fff !important;
  transform: translateY(-2px);
}

/* ========== Activity Section ========== */
.activity-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.activity-card {
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.activity-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.activity-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
  z-index: 1;
}

.activity-content h3 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.activity-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.activity-arrow {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  transition: transform 0.3s;
}

.activity-card:hover .activity-arrow {
  transform: translateX(4px);
}

/* ========== Category Section ========== */
.category-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A2E;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 22px;
}

.more-btn {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-card {
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 90px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.category-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: transform 0.3s;
}

.category-card:hover .category-icon-wrap {
  transform: scale(1.1);
}

.category-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

/* ========== Flash Sale Section ========== */
.flash-sale-section {
  margin-bottom: 24px;
}

.countdown-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF416C, #FF4B2B);
  padding: 6px 12px;
  border-radius: 20px;
}

.countdown-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
}

.countdown-time {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
}

.product-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.product-scroll::-webkit-scrollbar {
  display: none;
}

.flash-card {
  flex-shrink: 0;
  width: 200px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.flash-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 65, 108, 0.15);
}

.flash-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #FF416C, #FF4B2B);
  color: #fff;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 500;
  z-index: 1;
}

.product-image {
  width: 100%;
  height: 180px;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 40px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price {
  color: #FF416C;
  font-size: 18px;
  font-weight: 700;
}

.original {
  color: #C0C4CC;
  font-size: 12px;
  text-decoration: line-through;
}

.discount {
  background: #FFF0F3;
  color: #FF416C;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.product-sales {
  font-size: 12px;
  color: #909399;
}

/* ========== New Arrivals Section ========== */
.new-arrivals-section {
  margin-bottom: 24px;
}

.new-arrivals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.new-product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  aspect-ratio: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.new-product-card.large {
  grid-row: span 2;
  aspect-ratio: auto;
}

.new-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.new-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #667EEA, #764BA2);
  color: #fff;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 600;
  z-index: 1;
}

.new-product-card .product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
}

.product-overlay .product-name {
  color: #fff;
  margin-bottom: 6px;
}

.product-overlay .price {
  color: #fff;
  font-size: 20px;
}

/* ========== Brand Section ========== */
.brand-section {
  margin-bottom: 24px;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.brand-card {
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.brand-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
}

.brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.brand-logo {
  font-size: 36px;
  margin-bottom: 12px;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.brand-name {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.brand-promo {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

/* ========== Recommend Section ========== */
.recommend-section {
  margin-bottom: 40px;
}

.refresh-btn {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.waterfall-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.waterfall-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.waterfall-card .product-image {
  width: 100%;
  height: 200px;
}

.product-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.product-tags .el-tag {
  border-radius: 4px;
  font-size: 11px;
}

/* ========== Responsive ========== */
@media (max-width: 1200px) {
  .new-arrivals-grid,
  .waterfall-grid,
  .brand-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .activity-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .new-arrivals-grid,
  .waterfall-grid,
  .brand-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .banner-title {
    font-size: 28px;
  }

  .banner-desc {
    font-size: 14px;
  }
}
</style>