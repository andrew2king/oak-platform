<template>
  <div class="product-detail" v-loading="loading">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/category' }">{{ product.categoryName || '商品分类' }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="40" v-if="!loading">
      <el-col :span="10">
        <div class="image-gallery">
          <el-image :src="currentImage" class="main-image" fit="contain" />
          <div class="image-list">
            <el-image
              v-for="(img, idx) in product.images"
              :key="idx"
              :src="img"
              class="thumb-image"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
              fit="cover"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="14">
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="product-meta">
          <el-tag v-for="tag in product.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
        </div>
        <div class="price-box">
          <span class="price">¥{{ currentSku?.price || product.price }}</span>
          <span class="original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
        </div>

        <div class="info-item">
          <span class="label">销量</span>
          <span>{{ product.sales || 0 }}件</span>
        </div>

        <el-divider />

        <!-- SKU选择 -->
        <div v-for="spec in product.specs" :key="spec.name" class="info-item">
          <span class="label">{{ spec.name }}</span>
          <el-radio-group v-model="selectedSpecs[spec.name]" @change="updateSku">
            <el-radio-button v-for="val in spec.values" :key="val" :value="val">{{ val }}</el-radio-button>
          </el-radio-group>
        </div>

        <div class="info-item">
          <span class="label">数量</span>
          <el-input-number v-model="quantity" :min="1" :max="currentSku?.stock || product.stock || 99" />
          <span class="stock">库存 {{ currentSku?.stock || product.stock || 0 }} 件</span>
        </div>

        <div class="action-buttons">
          <el-button type="danger" size="large" @click="handleBuy">立即购买</el-button>
          <el-button size="large" @click="handleAddCart">加入购物车</el-button>
        </div>
      </el-col>
    </el-row>

    <el-tabs class="detail-tabs" v-if="!loading">
      <el-tab-pane label="商品详情">
        <div class="detail-content" v-html="product.content"></div>
        <div class="attributes" v-if="product.attributes?.length">
          <el-descriptions title="商品参数" :column="2" border>
            <el-descriptions-item v-for="attr in product.attributes" :key="attr.name" :label="attr.name">
              {{ attr.value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
      <el-tab-pane label="商品评价">
        <div class="reviews" v-if="product.reviews?.length">
          <div v-for="review in product.reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <span class="user">{{ review.userName }}</span>
              <el-rate :model-value="review.rating" disabled />
              <span class="time">{{ review.createTime }}</span>
            </div>
            <div class="review-content">{{ review.content }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无评价" />
      </el-tab-pane>
      <el-tab-pane label="相关推荐">
        <div class="related-products" v-if="product.relatedProducts?.length">
          <div v-for="p in product.relatedProducts" :key="p.id" class="related-card" @click="$router.push('/product/' + p.id)">
            <el-image :src="p.image" class="related-image" fit="cover" />
            <div class="related-info">
              <div class="related-name">{{ p.name }}</div>
              <div class="related-price">¥{{ p.price }}</div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无相关商品" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productAPI, type ProductDetail, type ProductSku } from '@/api/product'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const product = ref<ProductDetail>({} as ProductDetail)
const currentImage = ref('')
const quantity = ref(1)
const selectedSpecs = ref<Record<string, string>>({})

const currentSku = computed<ProductSku | undefined>(() => {
  if (!product.value.skus?.length) return undefined
  return product.value.skus.find(sku => {
    return sku.specs.every(spec => selectedSpecs.value[spec.name] === spec.value)
  })
})

const updateSku = () => {
  // 找到匹配的SKU图片
  if (currentSku.value?.image) {
    currentImage.value = currentSku.value.image
  }
}

const loadProduct = async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    product.value = await productAPI.getProductDetail(id)
    currentImage.value = product.value.images?.[0] || product.value.image || ''

    // 初始化规格选择
    if (product.value.specs?.length) {
      product.value.specs.forEach(spec => {
        selectedSpecs.value[spec.name] = spec.values[0]
      })
    }
  } catch (error) {
    ElMessage.error('商品不存在')
    router.push('/category')
  } finally {
    loading.value = false
  }
}

const handleBuy = () => {
  if (!currentSku.value && product.value.skus?.length) {
    ElMessage.warning('请选择规格')
    return
  }
  router.push('/checkout')
}

const handleAddCart = () => {
  ElMessage.success('已加入购物车')
}

watch(() => route.params.id, loadProduct)
onMounted(loadProduct)
</script>

<style scoped>
.product-detail { background: #fff; padding: 30px; border-radius: 8px; }
.breadcrumb { margin-bottom: 20px; }

/* 图片画廊 */
.image-gallery { }
.main-image { width: 100%; height: 400px; border-radius: 8px; border: 1px solid #eee; }
.image-list { display: flex; gap: 8px; margin-top: 12px; }
.thumb-image { width: 60px; height: 60px; border-radius: 4px; cursor: pointer; border: 2px solid transparent; }
.thumb-image.active { border-color: #409EFF; }

.product-title { font-size: 24px; color: #303133; margin-bottom: 12px; }
.product-meta { margin-bottom: 16px; display: flex; gap: 8px; }
.price-box { margin-bottom: 20px; background: #fff5f5; padding: 16px; border-radius: 8px; }
.price { font-size: 28px; color: #F56C6C; font-weight: bold; }
.original { font-size: 16px; color: #C0C4CC; text-decoration: line-through; margin: 0 12px; }
.info-item { margin: 16px 0; display: flex; align-items: center; }
.info-item .label { width: 60px; color: #909399; }
.stock { margin-left: 12px; color: #909399; font-size: 13px; }
.action-buttons { margin-top: 30px; display: flex; gap: 16px; }
.action-buttons .el-button { width: 180px; }

.detail-tabs { margin-top: 30px; }
.detail-content { padding: 20px; color: #606266; line-height: 2; }
.attributes { padding: 20px; }

/* 评价 */
.reviews { padding: 20px; }
.review-item { padding: 16px 0; border-bottom: 1px solid #eee; }
.review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.review-header .user { color: #303133; font-weight: 500; }
.review-header .time { color: #909399; font-size: 12px; }
.review-content { color: #606266; }

/* 相关商品 */
.related-products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 20px; }
.related-card { background: #f9f9f9; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; }
.related-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.related-image { width: 100%; height: 150px; }
.related-info { padding: 12px; }
.related-name { font-size: 14px; color: #303133; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.related-price { font-size: 16px; color: #F56C6C; font-weight: bold; margin-top: 6px; }
</style>