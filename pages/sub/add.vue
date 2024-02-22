<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="user_id" label="订阅用户ID">
        <uni-easyinput placeholder="订阅用户ID" v-model="formData.user_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="template_id" label="订阅模版ID">
        <uni-easyinput placeholder="订阅模版ID" v-model="formData.template_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="sub_date" label="订阅时间">
        <uni-datetime-picker return-type="timestamp" v-model="formData.sub_date"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="order_id" label="订单ID">
        <uni-easyinput placeholder="订单ID" v-model="formData.order_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="order_date" label="下单时间">
        <uni-datetime-picker return-type="timestamp" v-model="formData.order_date"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="goods_id" label="商品ID">
        <uni-easyinput placeholder="商品ID" v-model="formData.goods_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="goods_name" label="商品名称">
        <uni-easyinput placeholder="商品名称" v-model="formData.goods_name"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="sub_content" label="发送内容">
        <uni-easyinput placeholder="发送内容" v-model="formData.sub_content" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="sub_status" label="是否已发送">
        <switch @change="binddata('sub_status', $event.detail.value)" :checked="formData.sub_status"></switch>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/sub.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'sub';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }

  

  export default {
    data() {
      let formData = {
        "user_id": "",
        "template_id": "",
        "sub_date": null,
        "order_id": "",
        "order_date": null,
        "goods_id": "",
        "goods_name": "",
        "sub_content": "",
        "sub_status": false
      }
      return {
        formData,
        formOptions: {},
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).add(value).then((res) => {
          uni.showToast({
            title: '新增成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }
    }
  }
</script>
