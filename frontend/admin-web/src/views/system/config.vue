<template>
  <div class="system-config">
    <el-card>
      <template #header>
        <span>系统配置</span>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基础配置 -->
        <el-tab-pane label="基础配置" name="basic">
          <el-form :model="basicForm" label-width="120px" class="config-form">
            <el-form-item label="平台名称">
              <el-input v-model="basicForm.platformName" style="width: 400px" />
            </el-form-item>
            <el-form-item label="平台Logo">
              <el-upload action="#" :show-file-list="false">
                <el-image :src="basicForm.logo" style="width: 120px; height: 40px" fit="contain" />
              </el-upload>
            </el-form-item>
            <el-form-item label="客服电话">
              <el-input v-model="basicForm.servicePhone" style="width: 300px" />
            </el-form-item>
            <el-form-item label="客服邮箱">
              <el-input v-model="basicForm.serviceEmail" style="width: 300px" />
            </el-form-item>
            <el-form-item label="备案号">
              <el-input v-model="basicForm.icp" style="width: 300px" />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="basicForm.copyright" style="width: 400px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasic">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 订单配置 -->
        <el-tab-pane label="订单配置" name="order">
          <el-form :model="orderForm" label-width="150px" class="config-form">
            <el-divider>订单超时设置</el-divider>
            <el-form-item label="待支付超时">
              <el-input-number v-model="orderForm.unpaidTimeout" :min="5" :max="120" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="自动确认收货">
              <el-input-number v-model="orderForm.autoConfirmDays" :min="1" :max="30" />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item label="自动好评">
              <el-input-number v-model="orderForm.autoCommentDays" :min="1" :max="30" />
              <span class="unit">天</span>
            </el-form-item>

            <el-divider>运费设置</el-divider>
            <el-form-item label="默认运费">
              <el-input-number v-model="orderForm.defaultFreight" :min="0" :precision="2" />
              <span class="unit">元</span>
            </el-form-item>
            <el-form-item label="满免运费金额">
              <el-input-number v-model="orderForm.freeFreightAmount" :min="0" :precision="2" />
              <span class="unit">元</span>
            </el-form-item>

            <el-divider>退款设置</el-divider>
            <el-form-item label="退款审核期限">
              <el-input-number v-model="orderForm.refundDays" :min="1" :max="30" />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveOrder">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 库存配置 -->
        <el-tab-pane label="库存配置" name="inventory">
          <el-form :model="inventoryForm" label-width="150px" class="config-form">
            <el-divider>库存预警</el-divider>
            <el-form-item label="低库存阈值">
              <el-input-number v-model="inventoryForm.lowStockThreshold" :min="0" />
              <span class="unit">件</span>
            </el-form-item>
            <el-form-item label="严重缺货阈值">
              <el-input-number v-model="inventoryForm.criticalStockThreshold" :min="0" />
              <span class="unit">件</span>
            </el-form-item>

            <el-divider>库存预占</el-divider>
            <el-form-item label="下单预占库存">
              <el-switch v-model="inventoryForm.reserveOnOrder" />
            </el-form-item>
            <el-form-item label="预占超时时间">
              <el-input-number v-model="inventoryForm.reserveTimeout" :min="5" :max="60" />
              <span class="unit">分钟</span>
            </el-form-item>

            <el-divider>库存同步</el-divider>
            <el-form-item label="同步间隔">
              <el-input-number v-model="inventoryForm.syncInterval" :min="1" :max="60" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveInventory">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 短信配置 -->
        <el-tab-pane label="短信配置" name="sms">
          <el-form :model="smsForm" label-width="150px" class="config-form">
            <el-form-item label="短信服务商">
              <el-select v-model="smsForm.provider" style="width: 200px">
                <el-option label="阿里云短信" value="aliyun" />
                <el-option label="腾讯云短信" value="tencent" />
                <el-option label="网易云信" value="netease" />
              </el-select>
            </el-form-item>
            <el-form-item label="AccessKey">
              <el-input v-model="smsForm.accessKey" style="width: 400px" />
            </el-form-item>
            <el-form-item label="SecretKey">
              <el-input v-model="smsForm.secretKey" type="password" style="width: 400px" show-password />
            </el-form-item>
            <el-form-item label="短信签名">
              <el-input v-model="smsForm.signName" style="width: 200px" />
            </el-form-item>
            <el-divider>短信模板</el-divider>
            <el-table :data="smsTemplates" size="small" border>
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="code" label="模板编码" width="150" />
              <el-table-column prop="content" label="模板内容" />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-form-item style="margin-top: 16px">
              <el-button type="primary" @click="saveSms">保存配置</el-button>
              <el-button @click="testSms">发送测试短信</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 支付配置 -->
        <el-tab-pane label="支付配置" name="payment">
          <el-form :model="paymentForm" label-width="150px" class="config-form">
            <el-divider>微信支付</el-divider>
            <el-form-item label="启用微信支付">
              <el-switch v-model="paymentForm.wechatEnabled" />
            </el-form-item>
            <el-form-item label="AppID">
              <el-input v-model="paymentForm.wechatAppId" style="width: 400px" />
            </el-form-item>
            <el-form-item label="商户号">
              <el-input v-model="paymentForm.wechatMchId" style="width: 300px" />
            </el-form-item>
            <el-form-item label="API密钥">
              <el-input v-model="paymentForm.wechatApiKey" type="password" style="width: 400px" show-password />
            </el-form-item>

            <el-divider>支付宝</el-divider>
            <el-form-item label="启用支付宝">
              <el-switch v-model="paymentForm.alipayEnabled" />
            </el-form-item>
            <el-form-item label="AppID">
              <el-input v-model="paymentForm.alipayAppId" style="width: 400px" />
            </el-form-item>
            <el-form-item label="私钥">
              <el-input v-model="paymentForm.alipayPrivateKey" type="textarea" :rows="3" style="width: 400px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePayment">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

const basicForm = reactive({
  platformName: 'Oak新零售平台',
  logo: 'https://picsum.photos/120/40?random=logo',
  servicePhone: '400-888-8888',
  serviceEmail: 'service@oak.com',
  icp: '京ICP备12345678号',
  copyright: '© 2026 Oak Platform. All Rights Reserved.'
})

const orderForm = reactive({
  unpaidTimeout: 30,
  autoConfirmDays: 7,
  autoCommentDays: 7,
  defaultFreight: 10,
  freeFreightAmount: 99,
  refundDays: 7
})

const inventoryForm = reactive({
  lowStockThreshold: 50,
  criticalStockThreshold: 10,
  reserveOnOrder: true,
  reserveTimeout: 30,
  syncInterval: 5
})

const smsForm = reactive({
  provider: 'aliyun',
  accessKey: 'LTAI5tXXXXXXXXXXXXX',
  secretKey: 'XXXXXXXXXXXXXXXXXXXX',
  signName: 'Oak新零售'
})

const smsTemplates = ref([
  { type: '验证码', code: 'SMS_001', content: '您的验证码是${code}，5分钟内有效', status: true },
  { type: '订单通知', code: 'SMS_002', content: '您的订单${orderNo}已发货，请留意查收', status: true },
  { type: '退款通知', code: 'SMS_003', content: '您的退款申请已处理，金额${amount}元', status: true },
  { type: '营销短信', code: 'SMS_004', content: '尊敬的会员，您有一张优惠券即将过期', status: false }
])

const paymentForm = reactive({
  wechatEnabled: true,
  wechatAppId: 'wx1234567890abcdef',
  wechatMchId: '1234567890',
  wechatApiKey: '',
  alipayEnabled: true,
  alipayAppId: '2021001234567890',
  alipayPrivateKey: ''
})

const saveBasic = () => {
  ElMessage.success('基础配置已保存')
}

const saveOrder = () => {
  ElMessage.success('订单配置已保存')
}

const saveInventory = () => {
  ElMessage.success('库存配置已保存')
}

const saveSms = () => {
  ElMessage.success('短信配置已保存')
}

const testSms = () => {
  ElMessage.success('测试短信已发送')
}

const savePayment = () => {
  ElMessage.success('支付配置已保存')
}
</script>

<style scoped>
.config-form {
  max-width: 800px;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

:deep(.el-divider__text) {
  font-weight: 500;
  color: #303133;
}
</style>