// Mock数据服务
const Mock = {
  // 统计数据
  getDashboardStats: () => ({
    productCount: 12856,
    orderCount: 3456,
    memberCount: 89543,
    todayAmount: 1567890,
    orderTrend: [
      { date: '03-25', count: 234, amount: 123400 },
      { date: '03-26', count: 289, amount: 156700 },
      { date: '03-27', count: 312, amount: 178900 },
      { date: '03-28', count: 278, amount: 145600 },
      { date: '03-29', count: 356, amount: 198700 },
      { date: '03-30', count: 389, amount: 234500 },
      { date: '03-31', count: 412, amount: 256800 }
    ],
    categorySales: [
      { name: '服装', value: 356780 },
      { name: '食品', value: 234560 },
      { name: '数码', value: 189340 },
      { name: '家居', value: 145670 },
      { name: '美妆', value: 98760 }
    ],
    topProducts: [
      { rank: 1, name: '经典款T恤男女同款', image: '', sales: 2345, amount: 234500 },
      { rank: 2, name: '纯棉休闲裤男', image: '', sales: 1876, amount: 187600 },
      { rank: 3, name: '女士碎花连衣裙', image: '', sales: 1654, amount: 248100 },
      { rank: 4, name: '运动鞋男款透气', image: '', sales: 1432, amount: 286400 },
      { rank: 5, name: '男士商务衬衫', image: '', sales: 1289, amount: 128900 },
      { rank: 6, name: '女士针织开衫', image: '', sales: 1123, amount: 168450 },
      { rank: 7, name: '儿童纯棉T恤', image: '', sales: 987, amount: 49350 },
      { rank: 8, name: '男士牛仔裤', image: '', sales: 876, amount: 131400 },
      { rank: 9, name: '女士阔腿裤', image: '', sales: 765, amount: 114750 },
      { rank: 10, name: '运动短裤男女款', image: '', sales: 654, amount: 45780 }
    ],
    recentOrders: [
      { orderNo: 'O20260331001', member: '张***', amount: 1299, status: 3, time: '10:23:45' },
      { orderNo: 'O20260331002', member: '李***', amount: 567, status: 2, time: '10:15:32' },
      { orderNo: 'O20260331003', member: '王***', amount: 2345, status: 4, time: '09:58:21' },
      { orderNo: 'O20260331004', member: '赵***', amount: 890, status: 1, time: '09:45:12' },
      { orderNo: 'O20260331005', member: '刘***', amount: 3456, status: 3, time: '09:32:56' }
    ],
    alerts: [
      { type: 'warning', title: '库存预警', desc: 'SKU-00123 可用库存低于安全阈值', time: '5分钟前' },
      { type: 'error', title: '订单超时', desc: '订单 O20260330001 超过24小时未支付', time: '10分钟前' },
      { type: 'info', title: '新品上架', desc: '春季新品已自动上架', time: '30分钟前' },
      { type: 'success', title: '活动开启', desc: '限时秒杀活动已开始', time: '1小时前' }
    ]
  }),

  // 商品列表
  getProducts: (params = {}) => {
    const products = []
    const categories = ['男装', '女装', '童装', '运动', '配饰', '鞋靴', '箱包']
    const brands = ['NIKE', 'ADIDAS', 'UNIQLO', 'ZARA', 'H&M', '优衣库', 'GXG', '太平鸟']
    const statuses = [0, 1]

    for (let i = 1; i <= 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const salePrice = (Math.floor(Math.random() * 1000) + 99)
      const stock = Math.floor(Math.random() * 500)

      products.push({
        id: i,
        productCode: `P${String(i).padStart(6, '0')}`,
        productName: `${brand} ${category}系列商品${i}`,
        categoryName: category,
        brandName: brand,
        salePrice: salePrice,
        marketPrice: salePrice + 50,
        stock: stock,
        sales: Math.floor(Math.random() * 1000),
        status: status,
        createTime: `2026-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        mainImage: `https://picsum.photos/100/100?random=${i}`,
        isHot: Math.random() > 0.7 ? 1 : 0,
        isNew: Math.random() > 0.8 ? 1 : 0
      })
    }

    return {
      list: products.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: products.length
    }
  },

  // 商品详情
  getProductDetail: (id) => ({
    id: id,
    productCode: `P${String(id).padStart(6, '0')}`,
    productName: '经典款T恤男女同款2026春季新款',
    productNameEn: 'Classic T-Shirt Unisex 2026 Spring',
    categoryId: 1,
    categoryName: '男装',
    categoryPath: '服装 > 男装 > T恤',
    brandId: 1,
    brandName: 'UNIQLO',
    description: '经典圆领T恤，舒适棉质面料，适合日常穿着',
    detail: '<p>商品详情内容...</p>',
    mainImage: 'https://picsum.photos/400/400?random=1',
    images: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
      'https://picsum.photos/400/400?random=4'
    ],
    salePrice: 99,
    marketPrice: 199,
    costPrice: 45,
    unit: '件',
    weight: 0.3,
    status: 1,
    sort: 100,
    isHot: 1,
    isNew: 1,
    sales: 2345,
    stock: 567,
    createTime: '2026-03-01 10:00:00',
    skus: [
      { id: 1, skuCode: 'SKU001', skuName: '白色/S', specValues: '{"颜色":"白色","尺码":"S"}', salePrice: 99, stock: 120, frozenStock: 10 },
      { id: 2, skuCode: 'SKU002', skuName: '白色/M', specValues: '{"颜色":"白色","尺码":"M"}', salePrice: 99, stock: 150, frozenStock: 15 },
      { id: 3, skuCode: 'SKU003', skuName: '白色/L', specValues: '{"颜色":"白色","尺码":"L"}', salePrice: 99, stock: 98, frozenStock: 8 },
      { id: 4, skuCode: 'SKU004', skuName: '黑色/S', specValues: '{"颜色":"黑色","尺码":"S"}', salePrice: 99, stock: 88, frozenStock: 5 },
      { id: 5, skuCode: 'SKU005', skuName: '黑色/M', specValues: '{"颜色":"黑色","尺码":"M"}', salePrice: 99, stock: 111, frozenStock: 12 }
    ]
  }),

  // 订单列表
  getOrders: (params = {}) => {
    const orders = []
    const statusNames = ['待支付', '已支付', '待发货', '已发货', '已完成', '已取消', '已退款']
    const sources = ['小程序', 'APP', 'PC', '门店POS']

    for (let i = 1; i <= 50; i++) {
      const status = Math.floor(Math.random() * 7)
      const totalAmount = Math.floor(Math.random() * 3000) + 100
      const discount = Math.floor(totalAmount * 0.1)

      orders.push({
        id: i,
        orderNo: `O202603${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}${String(i).padStart(4, '0')}`,
        memberId: Math.floor(Math.random() * 10000) + 1,
        memberName: `用户${String(Math.floor(Math.random() * 9000) + 1000)}`,
        memberPhone: `138****${String(Math.floor(Math.random() * 9000) + 1000)}`,
        storeId: Math.floor(Math.random() * 10) + 1,
        storeName: `门店${Math.floor(Math.random() * 10) + 1}号`,
        source: sources[Math.floor(Math.random() * sources.length)],
        status: status,
        statusName: statusNames[status],
        totalQuantity: Math.floor(Math.random() * 5) + 1,
        totalAmount: totalAmount,
        discountAmount: discount,
        freightAmount: status >= 3 ? 10 : 0,
        payAmount: totalAmount - discount + 10,
        payType: Math.floor(Math.random() * 3) + 1,
        payTypeName: ['微信支付', '支付宝', '现金'][Math.floor(Math.random() * 3)],
        createTime: `2026-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        receiverName: '张先生',
        receiverPhone: '138****5678',
        receiverAddress: '北京市朝阳区xxx街道xxx号'
      })
    }

    return {
      list: orders.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: orders.length
    }
  },

  // 订单详情
  getOrderDetail: (orderNo) => ({
    orderNo: orderNo,
    memberId: 10001,
    memberName: '张明',
    memberPhone: '13812345678',
    memberLevel: '金卡会员',
    source: '小程序',
    orderType: 1,
    status: 3,
    statusName: '已发货',
    totalQuantity: 3,
    totalAmount: 567,
    discountAmount: 50,
    freightAmount: 10,
    payAmount: 527,
    payType: 1,
    payTypeName: '微信支付',
    createTime: '2026-03-31 10:23:45',
    payTime: '2026-03-31 10:24:12',
    deliveryTime: '2026-03-31 14:30:00',
    receiverName: '张明',
    receiverPhone: '13812345678',
    receiverAddress: '北京市朝阳区建国路88号SOHO现代城A座1201',
    remark: '请尽快发货，谢谢',
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF1234567890',
      traces: [
        { time: '2026-03-31 16:30:00', desc: '快件已到达北京朝阳区分拣中心' },
        { time: '2026-03-31 15:00:00', desc: '快件已从北京仓库发出' },
        { time: '2026-03-31 14:30:00', desc: '商家已发货' }
      ]
    },
    items: [
      { id: 1, productId: 1, skuId: 1, productCode: 'P000001', skuCode: 'SKU001', productName: '经典款T恤男女同款', skuName: '白色/S', productImage: 'https://picsum.photos/80/80?random=1', quantity: 2, price: 99, discountAmount: 20, amount: 178 },
      { id: 2, productId: 2, skuId: 3, productCode: 'P000002', skuCode: 'SKU003', productName: '纯棉休闲裤男', skuName: '黑色/L', productImage: 'https://picsum.photos/80/80?random=2', quantity: 1, price: 199, discountAmount: 0, amount: 199 }
    ]
  }),

  // 会员列表
  getMembers: (params = {}) => {
    const members = []
    const levels = ['普通会员', '银卡会员', '金卡会员', '钻石会员']
    const sources = ['小程序', 'APP', '门店']

    for (let i = 1; i <= 100; i++) {
      const levelIndex = Math.floor(Math.random() * 4)
      const points = levelIndex === 0 ? Math.floor(Math.random() * 999) :
                     levelIndex === 1 ? Math.floor(Math.random() * 4000) + 1000 :
                     levelIndex === 2 ? Math.floor(Math.random() * 15000) + 5000 :
                     Math.floor(Math.random() * 50000) + 20000

      members.push({
        id: i,
        memberNo: `M${String(i).padStart(8, '0')}`,
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        nickname: `用户${String(Math.floor(Math.random() * 90000) + 10000)}`,
        avatar: `https://picsum.photos/50/50?random=${i}`,
        realName: '张**',
        gender: Math.floor(Math.random() * 3),
        levelId: levelIndex + 1,
        levelName: levels[levelIndex],
        points: points,
        totalPoints: points + Math.floor(Math.random() * 10000),
        totalAmount: Math.floor(Math.random() * 50000) + 100,
        orderCount: Math.floor(Math.random() * 50) + 1,
        status: 1,
        source: sources[Math.floor(Math.random() * sources.length)],
        lastLoginTime: `2026-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        createTime: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      })
    }

    return {
      list: members.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: members.length
    }
  },

  // 会员详情
  getMemberDetail: (id) => ({
    id: id,
    memberNo: 'M00000001',
    phone: '13812345678',
    nickname: '时尚达人小明',
    avatar: 'https://picsum.photos/100/100?random=1',
    realName: '张明',
    gender: 1,
    birthday: '1990-05-15',
    email: 'zhang***@163.com',
    levelId: 3,
    levelName: '金卡会员',
    levelIcon: '🥇',
    points: 8560,
    totalPoints: 15680,
    totalAmount: 35680,
    orderCount: 45,
    avgOrderAmount: 793,
    status: 1,
    source: '小程序',
    createTime: '2025-06-15 10:30:00',
    lastLoginTime: '2026-03-31 09:15:23',
    tags: ['高消费', '活跃用户', '复购率高', '喜欢促销'],
    addressList: [
      { id: 1, name: '张明', phone: '13812345678', address: '北京市朝阳区建国路88号SOHO现代城A座1201', isDefault: true },
      { id: 2, name: '张明', phone: '13812345678', address: '北京市海淀区中关村大街1号', isDefault: false }
    ],
    recentOrders: [
      { orderNo: 'O20260330001', amount: 1299, status: 4, time: '2026-03-30' },
      { orderNo: 'O20260328002', amount: 567, status: 4, time: '2026-03-28' },
      { orderNo: 'O20260325003', amount: 2345, status: 4, time: '2026-03-25' }
    ],
    pointsLogs: [
      { id: 1, changeType: '消费获得', points: 120, balance: 8560, time: '2026-03-30 15:30:00' },
      { id: 2, changeType: '积分兑换', points: -200, balance: 8440, time: '2026-03-28 10:00:00' },
      { id: 3, changeType: '消费获得', points: 350, balance: 8640, time: '2026-03-25 14:20:00' }
    ]
  }),

  // 库存列表
  getInventory: (params = {}) => {
    const items = []
    const warehouses = ['北京总仓', '上海仓', '广州仓', '深圳仓', '成都仓', '武汉仓', '杭州仓', '南京仓']

    for (let i = 1; i <= 60; i++) {
      const availableStock = Math.floor(Math.random() * 500)
      const warningThreshold = Math.floor(Math.random() * 50) + 10

      items.push({
        id: i,
        skuId: i,
        skuCode: `SKU${String(i).padStart(6, '0')}`,
        skuName: `商品SKU-${i}`,
        productId: Math.ceil(i / 3),
        productCode: `P${String(Math.ceil(i / 3)).padStart(6, '0')}`,
        productName: `商品名称-${Math.ceil(i / 3)}`,
        warehouseId: Math.floor(Math.random() * 8) + 1,
        warehouseName: warehouses[Math.floor(Math.random() * warehouses.length)],
        warehouseType: Math.random() > 0.3 ? 1 : 2,
        availableStock: availableStock,
        frozenStock: Math.floor(Math.random() * 50),
        warningThreshold: warningThreshold,
        status: availableStock <= warningThreshold ? 'warning' : 'normal',
        lastUpdateTime: `2026-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      })
    }

    return {
      list: items.slice((params.pageNum - 1) * params.pageSize, params.pageNum * params.pageSize),
      total: items.length
    }
  },

  // 营销活动列表
  getActivities: () => [
    { id: 1, name: '春季焕新季', type: '满减', startTime: '2026-03-01', endTime: '2026-03-31', status: 1, participants: 12567, orders: 3456, amount: 567890 },
    { id: 2, name: '会员专享日', type: '折扣', startTime: '2026-03-15', endTime: '2026-03-15', status: 2, participants: 8956, orders: 2134, amount: 345678 },
    { id: 3, name: '限时秒杀', type: '秒杀', startTime: '2026-03-31', endTime: '2026-03-31', status: 1, participants: 5678, orders: 1567, amount: 234567 },
    { id: 4, name: '新人礼包', type: '优惠券', startTime: '2026-03-01', endTime: '2026-04-30', status: 1, participants: 23456, orders: 8765, amount: 678901 },
    { id: 5, name: '分享有礼', type: '裂变', startTime: '2026-03-20', endTime: '2026-04-20', status: 1, participants: 34567, orders: 4567, amount: 456789 }
  ],

  // 优惠券列表
  getCoupons: () => [
    { id: 1, name: '新人专享券', type: '满减', amount: 50, condition: '满200可用', totalCount: 10000, usedCount: 6789, status: 1, startTime: '2026-03-01', endTime: '2026-04-30' },
    { id: 2, name: '会员日折扣券', type: '折扣', amount: 8, condition: '全场通用', totalCount: 5000, usedCount: 3456, status: 1, startTime: '2026-03-15', endTime: '2026-03-15' },
    { id: 3, name: '春季焕新券', type: '满减', amount: 100, condition: '满500可用', totalCount: 8000, usedCount: 5234, status: 1, startTime: '2026-03-01', endTime: '2026-03-31' },
    { id: 4, name: '免邮券', type: '免邮', amount: 10, condition: '无门槛', totalCount: 20000, usedCount: 15678, status: 1, startTime: '2026-03-01', endTime: '2026-06-30' },
    { id: 5, name: '品牌专享券', type: '满减', amount: 200, condition: '满1000可用', totalCount: 3000, usedCount: 1234, status: 1, startTime: '2026-03-20', endTime: '2026-04-20' }
  ],

  // 分类数据
  getCategories: () => [
    { id: 1, name: '服装', icon: '👔', children: [
      { id: 11, name: '男装', children: [
        { id: 111, name: 'T恤' },
        { id: 112, name: '衬衫' },
        { id: 113, name: '裤子' },
        { id: 114, name: '外套' }
      ]},
      { id: 12, name: '女装', children: [
        { id: 121, name: '连衣裙' },
        { id: 122, name: 'T恤' },
        { id: 123, name: '裤装' },
        { id: 124, name: '外套' }
      ]},
      { id: 13, name: '童装', children: [
        { id: 131, name: '男童' },
        { id: 132, name: '女童' }
      ]}
    ]},
    { id: 2, name: '鞋靴', icon: '👟', children: [
      { id: 21, name: '运动鞋' },
      { id: 22, name: '休闲鞋' },
      { id: 23, name: '皮鞋' },
      { id: 24, name: '靴子' }
    ]},
    { id: 3, name: '配饰', icon: '👒', children: [
      { id: 31, name: '帽子' },
      { id: 32, name: '围巾' },
      { id: 33, name: '手套' }
    ]},
    { id: 4, name: '箱包', icon: '👜', children: [
      { id: 41, name: '双肩包' },
      { id: 42, name: '单肩包' },
      { id: 43, name: '手提包' },
      { id: 44, name: '行李箱' }
    ]}
  ]
}

export default Mock