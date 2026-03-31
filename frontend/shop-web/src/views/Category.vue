<template>
  <div class="category-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>全部分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="20">
      <!-- 左侧分类 -->
      <el-col :span="4">
        <el-card class="category-card">
          <template #header>
            <span>商品分类</span>
          </template>
          <el-menu :default-active="activeCategory" @select="handleCategorySelect">
            <el-menu-item index="all">全部分类</el-menu-item>
            <el-sub-menu v-for="cat in categories" :key="cat.id" :index="String(cat.id)">
              <template #title>{{ cat.icon }} {{ cat.name }}</template>
              <el-menu-item v-for="sub in cat.children" :key="sub.id" :index="String(sub.id)">
                {{ sub.name }}
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧商品列表 -->
      <el-col :span="20">
        <el-card>
          <!-- 筛选条件 -->
          <div class="filter-bar">
            <div class="filter-item">
              <span class="filter-label">价格：</span>
              <el-input v-model="priceMin" placeholder="最低" style="width: 80px" />
              <span>-</span>
              <el-input v-model="priceMax" placeholder="最高" style="width: 80px" />
              <el-button size="small" @click="handleFilter">确定</el-button>
            </div>
            <div class="filter-item">
              <span class="filter-label">品牌：</span>
              <el-select v-model="selectedBrand" placeholder="全部品牌" clearable size="small">
                <el-option label="Oak" value="Oak" />
                <el-option label="UNIQLO" value="UNIQLO" />
                <el-option label="ZARA" value="ZARA" />
                <el-option label="H&M" value="H&M" />
                <el-option label="NIKE" value="NIKE" />
                <el-option label="ADIDAS" value="ADIDAS" />
              </el-select>
            </div>
          </div>

          <!-- 排序 -->
          <div class="sort-bar">
            <span>排序：</span>
            <el-radio-group v-model="sortBy" size="small" @change="loadProducts">
              <el-radio-button label="">综合</el-radio-button>
              <el-radio-button label="sales">销量</el-radio-button>
              <el-radio-button label="price-asc">价格↑</el-radio-button>
              <el-radio-button label="price-desc">价格↓</el-radio-button>
              <el-radio-button label="createTime">新品</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 商品列表 -->
          <div v-loading="loading" class="product-list">
            <div v-if="products.length > 0" class="product-grid">
              <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push('/product/' + product.id)">
                <el-image :src="product.image" class="product-image" fit="cover">
                  <template #error>
                    <div class="image-error">暂无图片</div>
                  </template>
                </el-image>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-meta">
                    <span class="brand">{{ product.brandName }}</span>
                  </div>
                  <div class="product-price">
                    <span class="price">¥{{ product.price }}</span>
                    <span class="original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                  </div>
                  <div class="product-sales">已售 {{ product.sales }}件</div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无商品" />
          </div>

          <!-- 分页 -->
          <el-pagination
            v-if="total > pageSize"
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="loadProducts"
            class="pagination"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productAPI, type Product, type Category } from '@/api/product'

const route = useRoute()
const loading = ref(false)
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const activeCategory = ref('all')
const sortBy = ref('')
const priceMin = ref('')
const priceMax = ref('')
const selectedBrand = ref('')

const loadCategories = async () => {
  categories.value = await productAPI.getCategories()
}

const loadProducts = async () => {
  loading.value = true
  try {
    const [sortField, sortOrder] = sortBy.value.split('-') as [string, string]
    const result = await productAPI.getProducts({
      page: currentPage.value,
      pageSize: pageSize.value,
      categoryId: activeCategory.value === 'all' ? undefined : Number(activeCategory.value),
      minPrice: priceMin.value ? Number(priceMin.value) : undefined,
      maxPrice: priceMax.value ? Number(priceMax.value) : undefined,
      sortBy: sortField as any,
      sortOrder: sortOrder as any
    })
    products.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const handleCategorySelect = (index: string) => {
  activeCategory.value = index
  currentPage.value = 1
  loadProducts()
}

const handleFilter = () => {
  currentPage.value = 1
  loadProducts()
}

watch(() => route.query.category, (val) => {
  if (val) {
    activeCategory.value = String(val)
    loadProducts()
  }
})

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.category-page { padding: 0; }
.breadcrumb { margin-bottom: 16px; }

.category-card { min-height: 400px; }
.category-card :deep(.el-card__body) { padding: 0; }
.category-card :deep(.el-menu) { border-right: none; }

.filter-bar { display: flex; gap: 24px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-label { color: #606266; font-size: 14px; }

.sort-bar { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }

.product-list { min-height: 400px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; border: 1px solid #eee; }
.product-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.product-image { width: 100%; height: 180px; }
.image-error { width: 100%; height: 180px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #909399; }
.product-info { padding: 12px; }
.product-name { font-size: 14px; color: #303133; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-meta { margin-bottom: 6px; }
.brand { font-size: 12px; color: #909399; }
.price { font-size: 18px; color: #F56C6C; font-weight: bold; }
.original { font-size: 12px; color: #C0C4CC; text-decoration: line-through; margin-left: 6px; }
.product-sales { font-size: 12px; color: #909399; margin-top: 6px; }

.pagination { margin-top: 20px; justify-content: center; }
</style>