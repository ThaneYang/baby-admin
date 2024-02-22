<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="goods_id" label="">
        <uni-easyinput placeholder="商品id，参考media.schema表" v-model="formData.goods_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="source" label="">
        <uni-easyinput placeholder="所属平台id，参考media.schema表" v-model="formData.source"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="radio_index" label="">
        <uni-easyinput placeholder="上次阅读的章节索引" type="number" v-model="formData.radio_index"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="radio_title" label="">
        <uni-easyinput placeholder="上次阅读的章节名称" v-model="formData.radio_title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="current_value" label="">
        <uni-easyinput placeholder="已播放时长" type="number" v-model="formData.current_value"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="duration_value" label="">
        <uni-easyinput placeholder="总播放时长" type="number" v-model="formData.duration_value"></uni-easyinput>
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
  import { validator } from '../../js_sdk/validator/media-log.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'media-log';

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
        "goods_id": "",
        "source": "",
        "radio_index": null,
        "radio_title": "",
        "current_value": null,
        "duration_value": null
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
