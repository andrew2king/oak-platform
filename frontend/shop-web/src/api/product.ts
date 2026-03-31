/**
 * 商品API适配层 - 支持Mock、第三方API、京东联盟API
 *
 * 配置方式：
 * 1. 内部Mock: VITE_API_SOURCE=mock
 * 2. 第三方API: VITE_API_SOURCE=external, VITE_EXTERNAL_API_URL=xxx
 * 3. 京东联盟: VITE_API_SOURCE=jd, VITE_JD_PROXY_URL=xxx (后端代理地址)
 */

// API配置
const API_CONFIG = {
  source: (import.meta.env.VITE_API_SOURCE as string) || 'mock',
  externalUrl: (import.meta.env.VITE_EXTERNAL_API_URL as string) || '',
  apiKey: (import.meta.env.VITE_API_KEY as string) || '',
  jdProxyUrl: (import.meta.env.VITE_JD_PROXY_URL as string) || '',
  timeout: 10000,
  // 加价策略：在京东价格基础上加价比例
  priceMarkup: 0.15
}

// 商品数据适配器接口
interface ProductAdapter {
  getProductList(params: ProductQueryParams): Promise<ProductListResult>
  getProductDetail(id: string | number): Promise<ProductDetail>
  getCategories(): Promise<Category[]>
  searchProducts(keyword: string): Promise<Product[]>
}

// 统一的商品数据结构
interface Product {
  id: string | number
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  description?: string
  sales?: number
  stock?: number
  categoryId?: string | number
  categoryName?: string
  brandId?: string | number
  brandName?: string
  skus?: ProductSku[]
  specs?: ProductSpec[]
  tags?: string[]
  status?: number
  createTime?: string
  sourceId?: string | number // 原始平台商品ID
  source?: string // 来源平台
}

interface ProductSku {
  id: string | number
  skuCode: string
  skuName: string
  price: number
  stock: number
  image?: string
  specs: { name: string; value: string }[]
}

interface ProductSpec {
  name: string
  values: string[]
}

interface ProductDetail extends Product {
  content?: string
  attributes?: { name: string; value: string }[]
  relatedProducts?: Product[]
  reviews?: ProductReview[]
}

interface ProductReview {
  id: string | number
  userName: string
  avatar?: string
  rating: number
  content: string
  images?: string[]
  createTime: string
}

interface ProductQueryParams {
  page?: number
  pageSize?: number
  categoryId?: string | number
  brandId?: string | number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price' | 'sales' | 'createTime'
  sortOrder?: 'asc' | 'desc'
  eliteId?: number // 京东频道ID
}

interface ProductListResult {
  list: Product[]
  total: number
  page: number
  pageSize: number
}

interface Category {
  id: string | number
  name: string
  parentId?: string | number
  icon?: string
  image?: string
  sort?: number
  children?: Category[]
}

// ============ Mock数据适配器 ============
class MockProductAdapter implements ProductAdapter {
  private mockProducts: Product[] = []
  private mockCategories: Category[] = []

  constructor() {
    this.initMockData()
  }

  private initMockData() {
    // 分类数据 - 更丰富的分类
    this.mockCategories = [
      { id: 1, name: '女装', icon: '👗', children: [
        { id: 11, name: '连衣裙', parentId: 1 },
        { id: 12, name: 'T恤', parentId: 1 },
        { id: 13, name: '衬衫', parentId: 1 },
        { id: 14, name: '裤子', parentId: 1 },
        { id: 15, name: '外套', parentId: 1 },
        { id: 16, name: '针织衫', parentId: 1 }
      ]},
      { id: 2, name: '男装', icon: '👔', children: [
        { id: 21, name: 'T恤', parentId: 2 },
        { id: 22, name: '衬衫', parentId: 2 },
        { id: 23, name: '裤子', parentId: 2 },
        { id: 24, name: '外套', parentId: 2 },
        { id: 25, name: '西装', parentId: 2 }
      ]},
      { id: 3, name: '童装', icon: '🧒', children: [
        { id: 31, name: '男童', parentId: 3 },
        { id: 32, name: '女童', parentId: 3 },
        { id: 33, name: '婴儿装', parentId: 3 }
      ]},
      { id: 4, name: '配饰', icon: '🎒', children: [
        { id: 41, name: '箱包', parentId: 4 },
        { id: 42, name: '鞋履', parentId: 4 },
        { id: 43, name: '帽子', parentId: 4 },
        { id: 44, name: '围巾', parentId: 4 },
        { id: 45, name: '腰带', parentId: 4 }
      ]},
      { id: 5, name: '数码', icon: '📱', children: [
        { id: 51, name: '手机', parentId: 5 },
        { id: 52, name: '耳机', parentId: 5 },
        { id: 53, name: '智能穿戴', parentId: 5 }
      ]},
      { id: 6, name: '家居', icon: '🏠', children: [
        { id: 61, name: '床上用品', parentId: 6 },
        { id: 62, name: '收纳', parentId: 6 },
        { id: 63, name: '装饰', parentId: 6 }
      ]},
      { id: 7, name: '美妆', icon: '💄', children: [
        { id: 71, name: '护肤', parentId: 7 },
        { id: 72, name: '彩妆', parentId: 7 },
        { id: 73, name: '香水', parentId: 7 }
      ]},
      { id: 8, name: '运动', icon: '⚽', children: [
        { id: 81, name: '运动服饰', parentId: 8 },
        { id: 82, name: '运动鞋', parentId: 8 },
        { id: 83, name: '健身器材', parentId: 8 }
      ]}
    ]

    // 商品数据 - 更丰富的商品
    const productData = [
      { name: '经典款T恤男女同款', catId: 12, brand: 'Oak', price: 89, originalPrice: 159 },
      { name: '纯棉休闲裤男', catId: 23, brand: 'UNIQLO', price: 129, originalPrice: 199 },
      { name: '女士碎花连衣裙', catId: 11, brand: 'ZARA', price: 259, originalPrice: 399 },
      { name: '运动鞋男款透气', catId: 42, brand: 'NIKE', price: 459, originalPrice: 699 },
      { name: '男士商务衬衫', catId: 22, brand: 'GXG', price: 189, originalPrice: 299 },
      { name: '女士针织开衫', catId: 16, brand: 'H&M', price: 149, originalPrice: 249 },
      { name: '儿童纯棉T恤', catId: 31, brand: 'Oak', price: 59, originalPrice: 99 },
      { name: '时尚帆布背包', catId: 41, brand: 'Oak', price: 129, originalPrice: 199 },
      { name: '春季新款风衣', catId: 15, brand: 'ZARA', price: 599, originalPrice: 899 },
      { name: '轻薄羽绒服', catId: 24, brand: 'UNIQLO', price: 399, originalPrice: 599 },
      { name: '复古牛仔裤', catId: 23, brand: 'Levis', price: 349, originalPrice: 499 },
      { name: '休闲运动套装', catId: 81, brand: 'ADIDAS', price: 459, originalPrice: 699 },
      { name: '女士真丝衬衫', catId: 13, brand: '太平鸟', price: 299, originalPrice: 459 },
      { name: '男士羊毛大衣', catId: 24, brand: 'GXG', price: 899, originalPrice: 1299 },
      { name: '儿童连衣裙', catId: 32, brand: '巴拉巴拉', price: 139, originalPrice: 199 },
      { name: '运动休闲鞋', catId: 82, brand: 'New Balance', price: 399, originalPrice: 599 },
      { name: '无线蓝牙耳机', catId: 52, brand: 'Apple', price: 1299, originalPrice: 1599 },
      { name: '智能手表', catId: 53, brand: 'Huawei', price: 899, originalPrice: 1199 },
      { name: '护肤套装', catId: 71, brand: 'SK-II', price: 1299, originalPrice: 1599 },
      { name: '纯棉四件套', catId: 61, brand: '罗莱', price: 399, originalPrice: 599 },
      { name: '女士高跟鞋', catId: 42, brand: '百丽', price: 459, originalPrice: 699 },
      { name: '男士皮带', catId: 45, brand: '七匹狼', price: 199, originalPrice: 299 },
      { name: '瑜伽垫', catId: 83, brand: 'Keep', price: 99, originalPrice: 159 },
      { name: '男士西装套装', catId: 25, brand: '雅戈尔', price: 1299, originalPrice: 1899 }
    ]

    this.mockProducts = productData.map((p, i) => ({
      id: i + 1,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: `https://picsum.photos/400/400?random=${i + 1}`,
      images: [
        `https://picsum.photos/400/400?random=${i + 1}`,
        `https://picsum.photos/400/400?random=${i + 100}`,
        `https://picsum.photos/400/400?random=${i + 200}`
      ],
      description: `${p.name}，${p.brand}品牌，高品质面料，舒适透气，时尚百搭款式`,
      sales: Math.floor(Math.random() * 5000 + 100),
      stock: Math.floor(Math.random() * 500 + 50),
      categoryId: p.catId,
      categoryName: this.getCategoryName(p.catId),
      brandName: p.brand,
      skus: this.generateSkus(p.name, p.price),
      specs: [
        { name: '颜色', values: ['白色', '黑色', '灰色', '蓝色'] },
        { name: '尺码', values: ['S', 'M', 'L', 'XL', 'XXL'] }
      ],
      tags: ['热销', '新品', '限时优惠', '品质精选'].slice(0, Math.floor(Math.random() * 3 + 1)),
      status: 1,
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: 'mock'
    }))
  }

  private getCategoryName(catId: number): string {
    for (const cat of this.mockCategories) {
      if (cat.id === catId) return cat.name
      if (cat.children) {
        const child = cat.children.find(c => c.id === catId)
        if (child) return child.name
      }
    }
    return '未分类'
  }

  private generateSkus(name: string, basePrice: number): ProductSku[] {
    const colors = ['白色', '黑色', '灰色']
    const sizes = ['S', 'M', 'L', 'XL']
    const skus: ProductSku[] = []

    colors.forEach((color, ci) => {
      sizes.forEach((size, si) => {
        skus.push({
          id: `${ci}-${si}`,
          skuCode: `SKU${ci}${si}`,
          skuName: `${name} ${color} ${size}`,
          price: basePrice + Math.floor(Math.random() * 20),
          stock: Math.floor(Math.random() * 100 + 10),
          image: `https://picsum.photos/100/100?random=${ci}${si}`,
          specs: [{ name: '颜色', value: color }, { name: '尺码', value: size }]
        })
      })
    })
    return skus
  }

  async getProductList(params: ProductQueryParams): Promise<ProductListResult> {
    await this.delay(300)

    let filtered = [...this.mockProducts]

    if (params.categoryId) {
      filtered = filtered.filter(p => p.categoryId === params.categoryId)
    }
    if (params.keyword) {
      filtered = filtered.filter(p => p.name.includes(params.keyword!) || p.brandName?.includes(params.keyword!))
    }
    if (params.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= params.minPrice!)
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= params.maxPrice!)
    }

    // 排序
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy!] || 0
        const bVal = b[params.sortBy!] || 0
        return params.sortOrder === 'desc' ? Number(bVal) - Number(aVal) : Number(aVal) - Number(bVal)
      })
    }

    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return { list, total: filtered.length, page, pageSize }
  }

  async getProductDetail(id: string | number): Promise<ProductDetail> {
    await this.delay(200)
    const product = this.mockProducts.find(p => p.id === id || p.id === Number(id))
    if (!product) throw new Error('商品不存在')

    return {
      ...product,
      content: `<h2>商品详情</h2><p>${product.description}</p><p>这是一款高品质的${product.name}，采用优质面料制作，舒适透气，适合日常穿着。</p>`,
      attributes: [
        { name: '品牌', value: product.brandName || 'Oak' },
        { name: '材质', value: '100%纯棉' },
        { name: '风格', value: '简约休闲' },
        { name: '适合场景', value: '日常穿着、运动休闲' },
        { name: '洗涤方式', value: '可机洗' }
      ],
      relatedProducts: this.mockProducts.slice(0, 4),
      reviews: [
        { id: 1, userName: '用户***8', rating: 5, content: '质量很好，穿着舒适', createTime: '2026-03-28' },
        { id: 2, userName: '用户***6', rating: 4, content: '尺码标准，面料不错', createTime: '2026-03-25' }
      ]
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.delay(100)
    return this.mockCategories
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    await this.delay(200)
    return this.mockProducts.filter(p =>
      p.name.includes(keyword) ||
      p.brandName?.includes(keyword) ||
      p.categoryName?.includes(keyword)
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ============ 京东联盟API适配器 ============
/**
 * 京东联盟商品适配器
 *
 * 注意：京东联盟API需要签名认证，AppSecret不能暴露在前端
 * 因此需要通过后端代理服务调用
 *
 * 后端代理服务需要实现以下接口：
 * - GET /api/jd/goods - 商品列表
 * - GET /api/jd/goods/:id - 商品详情
 * - GET /api/jd/categories - 分类列表
 * - GET /api/jd/search - 商品搜索
 */
class JDProductAdapter implements ProductAdapter {
  private proxyUrl: string
  private priceMarkup: number

  constructor() {
    this.proxyUrl = API_CONFIG.jdProxyUrl
    this.priceMarkup = API_CONFIG.priceMarkup

    if (!this.proxyUrl) {
      console.warn('[JDAdapter] 未配置京东代理地址，将使用Mock数据')
    }
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (!this.proxyUrl) {
      // 如果没有配置代理地址，回退到Mock数据
      const mockAdapter = new MockProductAdapter()
      return mockAdapter[endpoint](params) as T
    }

    const url = new URL(endpoint, this.proxyUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    })

    if (!response.ok) {
      throw new Error(`京东API请求失败: ${response.status}`)
    }

    return response.json()
  }

  async getProductList(params: ProductQueryParams): Promise<ProductListResult> {
    const result = await this.request<any>('/api/jd/goods', {
      page: params.page || 1,
      size: params.pageSize || 20,
      cid: params.categoryId,
      keyword: params.keyword,
      min_price: params.minPrice,
      max_price: params.maxPrice,
      sort: params.sortBy,
      order: params.sortOrder,
      eliteId: params.eliteId || 1 // 默认好券商品频道
    })

    return {
      list: (result.data || result.list || []).map((item: any) => this.transformJDProduct(item)),
      total: result.total || result.totalCount || 0,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  }

  async getProductDetail(id: string | number): Promise<ProductDetail> {
    const result = await this.request<any>(`/api/jd/goods/${id}`)
    return this.transformJDProductDetail(result.data || result)
  }

  async getCategories(): Promise<Category[]> {
    const result = await this.request<any>('/api/jd/categories')
    return (result.data || result || []).map(this.transformJDCategory)
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    const result = await this.request<any>('/api/jd/search', { q: keyword })
    return (result.data || result.list || []).map((item: any) => this.transformJDProduct(item))
  }

  /**
   * 转换京东商品数据为统一格式
   * 同时应用加价策略
   */
  private transformJDProduct(item: any): Product {
    const jdPrice = Number(item.priceInfo?.price || item.price || 0)
    const originalPrice = Number(item.priceInfo?.originalPrice || item.originalPrice || jdPrice * 1.3)

    // 加价策略：在京东价格基础上加价
    const salePrice = Math.round(jdPrice * (1 + this.priceMarkup) * 100) / 100

    return {
      id: `jd_${item.skuId || item.id}`,
      sourceId: item.skuId || item.id,
      source: 'jd',
      name: item.goodsName || item.skuName || item.name,
      price: salePrice,
      originalPrice: originalPrice,
      image: item.imageInfo?.imageList?.[0]?.url || item.imageInfo?.whiteImage || item.image,
      images: item.imageInfo?.imageList?.map((img: any) => img.url) || [],
      description: item.goodsName || item.materialUrl,
      sales: Number(item.inOrderCount30Days || item.sales || 0),
      stock: 999, // 京东联盟API通常不返回实时库存
      categoryId: item.categoryInfo?.cid1 || item.cid,
      categoryName: item.categoryInfo?.cname || item.categoryName,
      brandName: item.brandName || item.brandInfo?.brandName,
      tags: this.generateTags(item),
      status: 1,
      createTime: item.createTime || new Date().toISOString().split('T')[0]
    }
  }

  private transformJDProductDetail(item: any): ProductDetail {
    const product = this.transformJDProduct(item)
    return {
      ...product,
      content: item.detail || item.introduction || `<p>${product.description}</p>`,
      attributes: [
        { name: '品牌', value: product.brandName || '京东自营' },
        { name: '来源', value: '京东商城' },
        { name: '发货', value: '京东配送' },
        { name: '售后', value: '京东售后' }
      ],
      relatedProducts: (item.relatedProducts || []).map((p: any) => this.transformJDProduct(p)),
      reviews: [] // 京东联盟API不提供评论数据
    }
  }

  private transformJDCategory(item: any): Category {
    return {
      id: item.cid || item.id,
      name: item.cname || item.name,
      parentId: item.pid || item.parentId,
      icon: item.icon,
      image: item.icon,
      sort: item.sort || item.rank,
      children: (item.children || item.subCategories || []).map(this.transformJDCategory)
    }
  }

  private generateTags(item: any): string[] {
    const tags: string[] = []
    if (item.isHot === 1 || item.goodCommentsRate > 95) tags.push('热销')
    if (item.isNew === 1) tags.push('新品')
    if (item.couponInfo?.couponList?.length) tags.push('有券')
    if (item.priceInfo?.price < item.priceInfo?.originalPrice * 0.7) tags.push('特惠')
    return tags.slice(0, 3)
  }
}

// ============ 第三方API适配器 ============
class ExternalProductAdapter implements ProductAdapter {
  private config: typeof API_CONFIG

  constructor() {
    this.config = API_CONFIG
    if (!this.config.externalUrl) {
      throw new Error('第三方API URL未配置，请设置VITE_EXTERNAL_API_URL环境变量')
    }
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.config.externalUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Key': this.config.apiKey
      },
      signal: AbortSignal.timeout(this.config.timeout)
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    return response.json()
  }

  async getProductList(params: ProductQueryParams): Promise<ProductListResult> {
    const result = await this.request<any>('/products', {
      page: params.page,
      size: params.pageSize,
      category_id: params.categoryId,
      keyword: params.keyword,
      min_price: params.minPrice,
      max_price: params.maxPrice,
      sort_by: params.sortBy,
      sort_order: params.sortOrder
    })

    return {
      list: (result.data || result.items || []).map(this.transformProduct),
      total: result.total || result.total_count || 0,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  }

  async getProductDetail(id: string | number): Promise<ProductDetail> {
    const result = await this.request<any>(`/products/${id}`)
    return this.transformProductDetail(result.data || result)
  }

  async getCategories(): Promise<Category[]> {
    const result = await this.request<any>('/categories')
    return (result.data || result || []).map(this.transformCategory)
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    const result = await this.request<any>('/products/search', { q: keyword })
    return (result.data || result.items || []).map(this.transformProduct)
  }

  private transformProduct(item: any): Product {
    return {
      id: item.id || item.product_id,
      name: item.name || item.product_name || item.title,
      price: Number(item.price || item.sale_price || 0),
      originalPrice: Number(item.original_price || item.market_price || item.price),
      image: item.image || item.main_image || item.cover || item.images?.[0],
      images: item.images || item.pictures || [],
      description: item.description || item.intro || '',
      sales: Number(item.sales || item.sold_count || 0),
      stock: Number(item.stock || item.inventory || 0),
      categoryId: item.category_id || item.cat_id,
      categoryName: item.category_name || item.cat_name,
      brandId: item.brand_id,
      brandName: item.brand_name || item.brand,
      skus: (item.skus || item.sku_list || []).map((s: any) => ({
        id: s.id || s.sku_id,
        skuCode: s.sku_code || s.code,
        skuName: s.sku_name || s.name,
        price: Number(s.price),
        stock: Number(s.stock || s.quantity),
        image: s.image,
        specs: s.specs || s.attributes || []
      })),
      specs: item.specs || item.specifications || [],
      tags: item.tags || [],
      status: item.status ?? 1,
      createTime: item.create_time || item.created_at
    }
  }

  private transformProductDetail(item: any): ProductDetail {
    const product = this.transformProduct(item)
    return {
      ...product,
      content: item.content || item.detail || item.description,
      attributes: item.attributes || item.params || [],
      relatedProducts: (item.related_products || item.recommend || []).map(this.transformProduct),
      reviews: (item.reviews || item.comments || []).map((r: any) => ({
        id: r.id || r.review_id,
        userName: r.user_name || r.nickname || '匿名用户',
        avatar: r.avatar || r.user_avatar,
        rating: Number(r.rating || r.score || 5),
        content: r.content || r.comment,
        images: r.images || [],
        createTime: r.create_time || r.created_at
      }))
    }
  }

  private transformCategory(item: any): Category {
    return {
      id: item.id || item.category_id,
      name: item.name || item.category_name,
      parentId: item.parent_id || item.pid,
      icon: item.icon,
      image: item.image || item.cover,
      sort: item.sort || item.sort_order,
      children: (item.children || item.sub_categories || []).map(this.transformCategory)
    }
  }
}

// ============ 统一API入口 ============
class ProductAPI {
  private adapter: ProductAdapter
  private currentSource: string

  constructor() {
    this.currentSource = API_CONFIG.source

    // 根据配置选择适配器
    switch (API_CONFIG.source) {
      case 'jd':
        console.log('[ProductAPI] 使用京东联盟API适配器')
        this.adapter = new JDProductAdapter()
        break
      case 'external':
        if (API_CONFIG.externalUrl) {
          console.log('[ProductAPI] 使用第三方API适配器:', API_CONFIG.externalUrl)
          this.adapter = new ExternalProductAdapter()
        } else {
          console.warn('[ProductAPI] 未配置第三方API地址，回退到Mock数据')
          this.adapter = new MockProductAdapter()
          this.currentSource = 'mock'
        }
        break
      default:
        console.log('[ProductAPI] 使用Mock数据适配器')
        this.adapter = new MockProductAdapter()
    }
  }

  // 切换数据源（运行时切换）
  switchToJD(proxyUrl: string) {
    API_CONFIG.source = 'jd'
    API_CONFIG.jdProxyUrl = proxyUrl
    this.adapter = new JDProductAdapter()
    this.currentSource = 'jd'
    console.log('[ProductAPI] 已切换到京东联盟API')
  }

  switchToExternal(url: string, apiKey?: string) {
    API_CONFIG.source = 'external'
    API_CONFIG.externalUrl = url
    API_CONFIG.apiKey = apiKey || ''
    this.adapter = new ExternalProductAdapter()
    this.currentSource = 'external'
    console.log('[ProductAPI] 已切换到第三方API:', url)
  }

  switchToMock() {
    API_CONFIG.source = 'mock'
    this.adapter = new MockProductAdapter()
    this.currentSource = 'mock'
    console.log('[ProductAPI] 已切换到Mock数据')
  }

  // 获取当前数据源
  getSource(): string {
    return this.currentSource
  }

  // 获取商品列表
  async getProducts(params: ProductQueryParams = {}): Promise<ProductListResult> {
    return this.adapter.getProductList(params)
  }

  // 获取商品详情
  async getProductDetail(id: string | number): Promise<ProductDetail> {
    return this.adapter.getProductDetail(id)
  }

  // 获取分类
  async getCategories(): Promise<Category[]> {
    return this.adapter.getCategories()
  }

  // 搜索商品
  async search(keyword: string): Promise<Product[]> {
    return this.adapter.searchProducts(keyword)
  }

  // 获取推荐商品
  async getRecommend(count: number = 8): Promise<Product[]> {
    const result = await this.adapter.getProductList({ pageSize: count, sortBy: 'sales', sortOrder: 'desc' })
    return result.list
  }

  // 获取新品
  async getNewArrivals(count: number = 4): Promise<Product[]> {
    const result = await this.adapter.getProductList({ pageSize: count, sortBy: 'createTime', sortOrder: 'desc' })
    return result.list
  }

  // 获取热销商品
  async getHotProducts(count: number = 8): Promise<Product[]> {
    const result = await this.adapter.getProductList({ pageSize: count, sortBy: 'sales', sortOrder: 'desc' })
    return result.list
  }
}

// 导出单例
export const productAPI = new ProductAPI()

// 导出类型
export type { Product, ProductDetail, ProductSku, ProductSpec, ProductQueryParams, ProductListResult, Category }

// 默认导出
export default productAPI