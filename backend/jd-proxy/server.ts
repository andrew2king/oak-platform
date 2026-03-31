/**
 * 京东联盟API代理服务
 *
 * 功能：
 * 1. 处理京东联盟API签名认证
 * 2. 转发前端请求到京东联盟API
 * 3. 返回标准化数据格式
 *
 * 使用前需要：
 * 1. 注册京东联盟账号：https://union.jd.com
 * 2. 创建应用获取 AppKey 和 AppSecret
 * 3. 创建推广位获取推广位ID
 */

import express from 'express'
import crypto from 'crypto'
import axios from 'axios'

const app = express()
app.use(express.json())

// 京东联盟配置
const JD_CONFIG = {
  appKey: process.env.JD_APP_KEY || '',
  appSecret: process.env.JD_APP_SECRET || '',
  unionId: process.env.JD_UNION_ID || '',
  positionId: process.env.JD_POSITION_ID || '',
  apiGateway: 'https://api.jd.com/routerjson'
}

// 生成京东API签名
function generateSign(params: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort()
  const signStr = sortedKeys.map(key => `${key}${params[key]}`).join('')
  return crypto.createHash('md5').update(appSecret + signStr + appSecret).digest('hex').toUpperCase()
}

// 调用京东API
async function callJDApi(method: string, params: Record<string, any> = {}) {
  const timestamp = new Date().toISOString().replace(/\.\d{3}/, '').replace(/[:-]/g, '')
  const v = '1.0'
  const format = 'json'

  const baseParams: Record<string, string> = {
    method,
    app_key: JD_CONFIG.appKey,
    timestamp,
    v,
    format,
    sign_method: 'md5'
  }

  // 合并业务参数
  const allParams = {
    ...baseParams,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )
  }

  // 生成签名
  const sign = generateSign(allParams, JD_CONFIG.appSecret)
  allParams.sign = sign

  try {
    const response = await axios.get(JD_CONFIG.apiGateway, {
      params: allParams,
      timeout: 10000
    })

    const resultKey = method.replace(/\./g, '_').replace(/_/g, '') + '_response'
    return response.data[resultKey] || response.data
  } catch (error: any) {
    console.error(`京东API调用失败 [${method}]:`, error.message)
    throw new Error(`京东API调用失败: ${error.message}`)
  }
}

// ============ API路由 ============

// 商品列表 - 精选商品查询
app.get('/api/jd/goods', async (req, res) => {
  try {
    const { page = 1, size = 20, cid, keyword, eliteId = 1 } = req.query

    const result = await callJDApi('jd.union.open.goods.jingfen.query', {
      eliteId: Number(eliteId), // 频道ID：1-好券商品, 2-精选卖品, 3-排品池
      pageIndex: Number(page),
      pageSize: Number(size),
      cid: cid ? Number(cid) : undefined,
      keyword: keyword as string
    })

    const data = result.jd_union_open_goods_jingfen_query_responce?.jingfenGoodsResult || {}
    const goods = data.goodsInfoList || []

    res.json({
      data: goods,
      total: data.totalCount || goods.length,
      page: Number(page),
      pageSize: Number(size)
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 商品详情
app.get('/api/jd/goods/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await callJDApi('jd.union.open.goods.promotiongoodsinfo.query', {
      skuIds: [Number(id.replace('jd_', ''))]
    })

    const goods = result.jd_union_open_goods_promotiongoodsinfo_query_responce?.goodsList?.[0]

    if (!goods) {
      return res.status(404).json({ error: '商品不存在' })
    }

    res.json({ data: goods })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 商品搜索
app.get('/api/jd/search', async (req, res) => {
  try {
    const { q, page = 1, size = 20 } = req.query

    const result = await callJDApi('jd.union.open.goods.query', {
      keyword: q as string,
      pageIndex: Number(page),
      pageSize: Number(size)
    })

    const data = result.jd_union_open_goods_query_responce?.queryGoodsResult || {}
    const goods = data.goodsList || []

    res.json({
      data: goods,
      total: data.totalCount || goods.length,
      page: Number(page),
      pageSize: Number(size)
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 分类列表
app.get('/api/jd/categories', async (req, res) => {
  try {
    // 京东商品分类（部分常用分类）
    const categories = [
      { id: 1, name: '女装', pid: 0, children: [
        { id: 11, name: '连衣裙', pid: 1 },
        { id: 12, name: 'T恤', pid: 1 },
        { id: 13, name: '衬衫', pid: 1 },
        { id: 14, name: '裤子', pid: 1 },
        { id: 15, name: '外套', pid: 1 }
      ]},
      { id: 2, name: '男装', pid: 0, children: [
        { id: 21, name: 'T恤', pid: 2 },
        { id: 22, name: '衬衫', pid: 2 },
        { id: 23, name: '裤子', pid: 2 },
        { id: 24, name: '外套', pid: 2 }
      ]},
      { id: 3, name: '童装', pid: 0, children: [
        { id: 31, name: '男童', pid: 3 },
        { id: 32, name: '女童', pid: 3 }
      ]},
      { id: 4, name: '数码', pid: 0, children: [
        { id: 41, name: '手机', pid: 4 },
        { id: 42, name: '电脑', pid: 4 },
        { id: 43, name: '耳机', pid: 4 }
      ]},
      { id: 5, name: '家居', pid: 0, children: [
        { id: 51, name: '床上用品', pid: 5 },
        { id: 52, name: '收纳', pid: 5 }
      ]},
      { id: 6, name: '美妆', pid: 0, children: [
        { id: 61, name: '护肤', pid: 6 },
        { id: 62, name: '彩妆', pid: 6 }
      ]}
    ]

    res.json({ data: categories })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 获取推广链接
app.post('/api/jd/promotion', async (req, res) => {
  try {
    const { skuIds, positionId } = req.body

    const result = await callJDApi('jd.union.open.promotion.bysubunionid.get', {
      materialId: skuIds.join(','),
      positionId: positionId || JD_CONFIG.positionId,
      subUnionId: JD_CONFIG.unionId
    })

    const data = result.jd_union_open_promotion_bysubunionid_get_responce || {}

    res.json({
      data: {
        clickURL: data.clickURL,
        shortURL: data.shortURL
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 订单查询（用于追踪京东订单状态）
app.get('/api/jd/orders', async (req, res) => {
  try {
    const { page = 1, size = 50, startTime, endTime } = req.query

    const result = await callJDApi('jd.union.open.order.row.query', {
      pageIndex: Number(page),
      pageSize: Number(size),
      startTime: startTime as string,
      endTime: endTime as string,
      type: 1 // 1-下单时间, 2-完成时间, 3-更新时间
    })

    const data = result.jd_union_open_order_row_query_responce?.orderInfoResult || {}

    res.json({
      data: data.orderList || [],
      total: data.totalCount || 0,
      page: Number(page),
      pageSize: Number(size)
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', config: { appKey: JD_CONFIG.appKey ? '已配置' : '未配置' } })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`京东联盟API代理服务已启动: http://localhost:${PORT}`)
  console.log(`AppKey: ${JD_CONFIG.appKey ? '已配置' : '未配置'}`)
})

export default app