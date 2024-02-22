<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="name" label="标题" required>
        <uni-easyinput placeholder="标题" v-model="formData.name" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="source" label="所属平台" required>
        <uni-data-picker v-model="formData.source" collection="media-category" field="name as text, code as value"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="tag_id" label="所属分类" required>
        <uni-data-picker v-model="formData.tag_id" collection="media-tags" field="name as text, code as value"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="goods_id" label="所属商品ID">
        <uni-easyinput placeholder="所属商品ID" v-model="formData.goods_id" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="banner" label="图片">
        <uni-file-picker file-mediatype="image" file-extname="jpg,png,jpeg" :limit="1" return-type="array" v-model="formData.banner"></uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="radios" label="音频">
        <cus-uni-file-picker file-mediatype="mp3" file-extname="mp3,m4a" :limit="999" return-type="array" v-model="formData.radios"></cus-uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="files" label="文稿">
        <cus-uni-file-picker file-mediatype="all" file-extname="pdf,ppt,pptx,xls,xlsx,doc,docx,jpg,png,jpeg" :limit="999" return-type="array" v-model="formData.files"></cus-uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="media_desc" label="详细描述">
        <my-editor placeholder="商品详细描述" v-model="formData.media_desc" trim="both"></my-editor>
      </uni-forms-item>
      <uni-forms-item name="is_need_vip" label="是否需要vip才能免费看">
        <switch @change="binddata('is_need_vip', $event.detail.value)" :checked="formData.is_need_vip"></switch>
      </uni-forms-item>
      <uni-forms-item name="is_on_sale" label="是否上架">
        <switch @change="binddata('is_on_sale', $event.detail.value)" :checked="formData.is_on_sale"></switch>
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
  import { validator } from '../../js_sdk/validator/media.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'media';

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
        "name": "",
        "source": "",
        "tag_id": "",
        "goods_id": "",
        "banner": [],
        "radios": [],
        "files": [],
        "media_desc": "",
        "is_need_vip": true,
        "is_on_sale": true
      }
      return {
        formData,
        formOptions: {},
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
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
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("name,source,tag_id,goods_id,banner,radios,files,media_desc,is_need_vip,is_on_sale").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
            
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>
