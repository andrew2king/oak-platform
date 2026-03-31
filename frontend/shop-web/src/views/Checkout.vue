<template>
  <div class="checkout-page">
    <el-steps :active="currentStep" align-center class="checkout-steps">
      <el-step title="购物车" />
      <el-step title="确认订单" />
      <el-step title="支付" />
      <el-step title="完成" />
    </el-steps>

    <!-- 步骤2: 确认订单 -->
    <el-card v-if="currentStep === 1" class="order-card">
      <template #header>
        <span>确认订单信息</span>
      </template>

      <!-- 收货地址 -->
      <div class="section">
        <h3>收货地址</h3>
        <el-radio-group v-model="selectedAddress" class="address-list">
          <el-radio v-for="addr in addresses" :key="addr.id" :value="addr.id" class="address-item">
            <div class="address-content">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <span class="address">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</span>
              <el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
            </div>
          </el-radio>
        </el-radio-group>
        <el-button link type="primary" @click="showAddressDialog = true">+ 新增收货地址</el-button>
      </div>

      <el-divider />

      <!-- 商品清单 -->
      <div class="section">
        <h3>商品清单</h3>
        <el-table :data="cartItems" border>
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="product-cell">
                <el-image :src="row.image" class="product-image" fit="cover" />
                <div>
                  <div class="product-name">{{ row.name }}</div>
                  <div class="product-sku">{{ row.sku }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              <span class="subtotal">¥{{ row.price * row.quantity }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider />

      <!-- 优惠券 -->
      <div class="section">
        <h3>优惠券</h3>
        <el-radio-group v-model="selectedCoupon">
          <el-radio :value="0">不使用优惠券</el-radio>
          <el-radio v-for="coupon in availableCoupons" :key="coupon.id" :value="coupon.id">
            {{ coupon.name }} (满{{ coupon.minAmount }}减{{ coupon.amount }})
          </el-radio>
        </el-radio-group>
      </div>

      <el-divider />

      <!-- 配送方式 -->
      <div class="section">
        <h3>配送方式</h3>
        <el-radio-group v-model="deliveryMethod">
          <el-radio value="express">快递配送 (运费 ¥{{ freight }})</el-radio>
          <el-radio value="pickup">门店自提 (免运费)</el-radio>
        </el-radio-group>
      </div>

      <el-divider />

      <!-- 订单备注 -->
      <div class="section">
        <h3>订单备注</h3>
        <el-input v-model="orderRemark" type="textarea" :rows="2" placeholder="选填，如有特殊需求请备注" />
      </div>

      <!-- 结算信息 -->
      <div class="settlement">
        <div class="settlement-item">
          <span>商品总额：</span>
          <span>¥{{ productTotal }}</span>
        </div>
        <div class="settlement-item" v-if="couponDiscount > 0">
          <span>优惠券：</span>
          <span class="discount">-¥{{ couponDiscount }}</span>
        </div>
        <div class="settlement-item">
          <span>运费：</span>
          <span>¥{{ freight }}</span>
        </div>
        <div class="settlement-item total">
          <span>应付金额：</span>
          <span class="total-price">¥{{ totalAmount }}</span>
        </div>
        <el-button type="primary" size="large" @click="submitOrder">提交订单</el-button>
      </div>
    </el-card>

    <!-- 步骤3: 支付 -->
    <el-card v-if="currentStep === 2" class="pay-card">
      <div class="pay-amount">
        <span>支付金额</span>
        <span class="amount">¥{{ totalAmount }}</span>
      </div>
      <el-divider>选择支付方式</el-divider>
      <div class="pay-methods">
        <div class="pay-method" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
          <span class="icon">💚</span>
          <span>微信支付</span>
        </div>
        <div class="pay-method" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
          <span class="icon">💙</span>
          <span>支付宝</span>
        </div>
      </div>
      <el-button type="primary" size="large" @click="handlePay" :loading="paying">
        立即支付
      </el-button>
    </el-card>

    <!-- 步骤4: 完成 -->
    <el-result v-if="currentStep === 3" icon="success" title="支付成功" sub-title="订单已提交，请等待发货">
      <template #extra>
        <el-button type="primary" @click="$router.push('/orders')">查看订单</el-button>
        <el-button @click="$router.push('/')">继续购物</el-button>
      </template>
    </el-result>

    <!-- 新增地址对话框 -->
    <el-dialog v-model="showAddressDialog" title="新增收货地址" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item label="所在地区">
          <el-cascader v-model="addressForm.region" :options="regionOptions" style="width: 100%" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.detail" type="textarea" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const currentStep = ref(1)
const selectedAddress = ref(1)
const selectedCoupon = ref(0)
const deliveryMethod = ref('express')
const orderRemark = ref('')
const payMethod = ref('wechat')
const paying = ref(false)
const showAddressDialog = ref(false)

const cartItems = ref([
  { id: 1, name: '经典款T恤男女同款', sku: '白色 / M', price: 59, quantity: 2, image: 'https://picsum.photos/80/80?random=checkout1' },
  { id: 2, name: '纯棉休闲裤男', sku: '黑色 / 32', price: 99, quantity: 1, image: 'https://picsum.photos/80/80?random=checkout2' }
])

const addresses = ref([
  { id: 1, name: '张三', phone: '138****8888', province: '北京市', city: '朝阳区', district: '建国路', detail: '88号', isDefault: true },
  { id: 2, name: '李四', phone: '139****9999', province: '上海市', city: '静安区', district: '南京西路', detail: '1038号', isDefault: false }
])

const availableCoupons = ref([
  { id: 1, name: '新人优惠券', minAmount: 100, amount: 20 },
  { id: 2, name: '满减券', minAmount: 200, amount: 50 }
])

const addressForm = ref({
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

const regionOptions = ref([
  { value: 'beijing', label: '北京市', children: [
    { value: 'chaoyang', label: '朝阳区' },
    { value: 'haidian', label: '海淀区' }
  ]},
  { value: 'shanghai', label: '上海市', children: [
    { value: 'jingan', label: '静安区' },
    { value: 'pudong', label: '浦东新区' }
  ]}
])

const productTotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const freight = computed(() => deliveryMethod.value === 'express' ? 10 : 0)
const couponDiscount = computed(() => {
  const coupon = availableCoupons.value.find(c => c.id === selectedCoupon.value)
  return coupon ? coupon.amount : 0
})
const totalAmount = computed(() => productTotal.value - couponDiscount.value + freight.value)

const submitOrder = () => {
  currentStep.value = 2
}

const handlePay = async () => {
  paying.value = true
  setTimeout(() => {
    paying.value = false
    currentStep.value = 3
    ElMessage.success('支付成功')
  }, 2000)
}

const saveAddress = () => {
  ElMessage.success('地址已保存')
  showAddressDialog.value = false
}
</script>

<style scoped>
.checkout-steps { margin-bottom: 24px; }

.order-card { padding: 20px; }
.section { margin-bottom: 16px; }
.section h3 { font-size: 16px; color: #303133; margin-bottom: 12px; }

.address-list { display: flex; flex-direction: column; gap: 12px; }
.address-item { padding: 12px; border: 1px solid #eee; border-radius: 4px; }
.address-item.is-checked { border-color: #409EFF; }
.address-content { display: flex; gap: 16px; align-items: center; }
.address-content .name { font-weight: bold; }
.address-content .address { color: #606266; }

.product-cell { display: flex; align-items: center; gap: 12px; }
.product-image { width: 60px; height: 60px; border-radius: 4px; }
.product-name { font-size: 14px; }
.product-sku { font-size: 12px; color: #909399; }
.subtotal { color: #F56C6C; font-weight: bold; }

.settlement { text-align: right; padding: 16px; background: #f9f9f9; border-radius: 8px; }
.settlement-item { margin-bottom: 8px; display: flex; justify-content: flex-end; gap: 20px; }
.settlement-item.total { font-size: 18px; font-weight: bold; margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; }
.discount { color: #67C23A; }
.total-price { color: #F56C6C; font-size: 24px; }

.pay-card { text-align: center; padding: 40px; }
.pay-amount { margin-bottom: 20px; }
.pay-amount .amount { font-size: 36px; color: #F56C6C; font-weight: bold; }
.pay-methods { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; }
.pay-method { padding: 20px 40px; border: 2px solid #eee; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pay-method:hover { border-color: #409EFF; }
.pay-method.active { border-color: #409EFF; background: #ecf5ff; }
.pay-method .icon { font-size: 32px; }
</style>