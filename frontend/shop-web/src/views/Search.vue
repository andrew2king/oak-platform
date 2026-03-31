<template>
  <div class="search-page">
    <!-- 搜索框 -->
    <el-card class="search-card">
      <el-input v-model="keyword" placeholder="搜索商品、品牌、分类" size="large" class="search-input" @keyup.enter="handleSearch">
        <template #append>
          <el-button :icon="Search" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <div class="hot-keywords">
        <span>热门搜索：</span>
        <el-tag v-for="kw in hotKeywords" :key="kw" class="kw-tag" @click="keyword = kw; handleSearch()">{{ kw }}</el-tag>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <el-card v-if="searched" style="margin-top: 16px">
      <template #header>
        <div class="result-header">
          <span>搜索 "{{ keyword }}" 共找到 {{ total }} 件商品</span>
          <el-radio-group v-model="sortBy" size="small" @change="doSearch">
            <el-radio-button label="">综合排序</el-radio-button>
            <el-radio-button label="sales">销量优先</el-radio-button>
            <el-radio-button label="price-asc">价格从低到高</el-radio-button>
            <el-radio-button label="price-desc">价格从高到低</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div v-loading="loading" class="search-results">
        <div v-if="products.length > 0" class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push('/product/' + product.id)">
            <el-image :src="product.image" class="product-image" fit="cover" />
            <div class="product-info">
              <div class="product-name" v-html="highlightKeyword(product.name)"></div>
              <div class="product-brand">{{ product.brandName }}</div>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span class="original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              </div>
              <div class="product-sales">已售 {{ product.sales }}件</div>
            </div>
          </div>
        </div>
        <el-empty v-else description="没有找到相关商品" />
      </div>

      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="doSearch"
        class="pagination"
      />
    </el-card>

    <!-- 猜你喜欢 -->
    <el-card v-else style="margin-top: 16px">
      <template #header>
        <span>🔥 猜你喜欢</span>
      </template>
      <div class="recommend-grid">
        <div v-for="product in recommendProducts" :key="product.id" class="product-card" @click="$router.push('/product/' + product.id)">
          <el-image :src="product.image" class="product-image" fit="cover" />
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">
              <span class="price">¥{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { productAPI, type Product } from '@/api/product'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const searched = ref(false)
const loading = ref(false)
const products = ref<Product[]>([])
const recommendProducts = ref<Product[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(16)
const sortBy = ref('')

const hotKeywords = ref(['T恤', '连衣裙', '运动鞋', '休闲裤', '衬衫', '背包', '新品', '折扣'])

const handleSearch = () => {
  if (!keyword.value.trim()) return
  router.push({ path: '/search', query: { q: keyword.value } })
}

const doSearch = async () => {
  if (!keyword.value.trim()) return

  searched.value = true
  loading.value = true

  try {
    const [sortField, sortOrder] = sortBy.value.split('-') as [string, string]
    const result = await productAPI.search(keyword.value)
    // 简化处理，实际应调用带分页的搜索API
    products.value = result
    total.value = result.length
  } finally {
    loading.value = false
  }
}

const highlightKeyword = (text: string) => {
  if (!keyword.value) return text
  const regex = new RegExp(`(${keyword.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

onMounted(async () => {
  recommendProducts.value = await productAPI.getRecommend(8)

  if (route.query.q) {
    keyword.value = String(route.query.q)
    doSearch()
  }
})
</script>

<style scoped>
.search-card { padding: 20px; }
.search-input { max-width: 600px; }
.hot-keywords { margin-top: 12px; font-size: 13px; color: #909399; }
.kw-tag { margin-left: 8px; cursor: pointer; }

.result-header { display: flex; justify-content: space-between; align-items: center; }

.search-results { min-height: 300px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.recommend-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.product-card { background: #f9f9f9; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; }
.product-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.product-image { width: 100%; height: 180px; }
.product-info { padding: 12px; }
.product-name { font-size: 14px; color: #303133; margin-bottom: 6px; }
.product-name :deep(.highlight) { color: #F56C6C; font-weight: bold; }
.product-brand { font-size: 12px; color: #909399; margin-bottom: 4px; }
.price { font-size: 18px; color: #F56C6C; font-weight: bold; }
.original { font-size: 12px; color: #C0C4CC; text-decoration: line-through; margin-left: 6px; }
.product-sales { font-size: 12px; color: #909399; margin-top: 6px; }

.pagination { margin-top: 20px; justify-content: center; }
</style>