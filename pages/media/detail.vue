<template>
  <view class="container">
    <unicloud-db ref="udb" v-slot:default="{data, loading, error, options}" :options="options" :collection="collectionList" :getone="true" :manual="true">
      <view v-if="error">{{error.message}}</view>
      <view v-else-if="loading">
        <uni-load-more :contentText="loadMore" status="loading"></uni-load-more>
      </view>
      <view v-else-if="data">
        <view>
          <text>标题</text>
          <text>{{data.name}}</text>
        </view>
        <view>
          <text>所属平台</text>
          <text>{{data.source && data.source[0] && data.source[0].text}}</text>
        </view>
        <view>
          <text>所属分类</text>
          <text>{{data.tag_id && data.tag_id[0] && data.tag_id[0].text}}</text>
        </view>
        <view>
          <text>图片</text>
          <template v-for="(file, j) in data.banner">
            <uni-file-picker v-if="file.fileType == 'image'" :value="file" :file-mediatype="file.fileType" return-type="object" readonly></uni-file-picker>
            <uni-link v-else :href="file.url" :text="file.url"></uni-link>
          </template>
        </view>
        <view>
          <text>音频文件</text>
          <template v-for="(file, j) in data.radios">
            <uni-file-picker v-if="file.fileType == 'image'" :value="file" :file-mediatype="file.fileType" return-type="object" readonly></uni-file-picker>
            <uni-link v-else :href="file.url" :text="file.url"></uni-link>
          </template>
        </view>
        <view>
          <text>详细描述</text>
          <text>{{data.goods_desc}}</text>
        </view>
        <view>
          <text>是否上架</text>
          <text>{{data.is_on_sale == true ? '✅' : '❌'}}</text>
        </view>
      </view>
    </unicloud-db>
    <view class="btns">
      <button type="primary" @click="handleUpdate">修改</button>
      <button type="warn" class="btn-delete" @click="handleDelete">删除</button>
    </view>
  </view>
</template>

<script>
  // 由schema2code生成，包含校验规则和enum静态数据
  import { enumConverter } from '../../js_sdk/validator/media.js'
  const db = uniCloud.database()

  export default {
    data() {
      return {
        queryWhere: '',
        collectionList: [ db.collection('media').field('name,source,tag_id,banner,radios,goods_desc,is_on_sale').getTemp(),db.collection('opendb-mall-category').field('name as text, code').getTemp(),db.collection('opendb-mall-tags').field('name as text, code').getTemp() ],
        loadMore: {
          contentdown: '',
          contentrefresh: '',
          contentnomore: ''
        },
        options: {
          // 将scheme enum 属性静态数据中的value转成text
          ...enumConverter
        }
      }
    },
    onLoad(e) {
      this._id = e.id
    },
    onReady() {
      if (this._id) {
        this.collectionList = [ db.collection('media').where('_id=="' + this._id + '"').field('name,source,tag_id,banner,radios,goods_desc,is_on_sale').getTemp(),db.collection('opendb-mall-category').field('name as text, code').getTemp(),db.collection('opendb-mall-tags').field('name as text, code').getTemp() ]
      }
    },
    methods: {
      handleUpdate() {
        // 打开修改页面
        uni.navigateTo({
          url: './edit?id=' + this._id,
          events: {
            // 监听修改页面成功修改数据后, 刷新当前页面数据
            refreshData: () => {
              this.$refs.udb.loadData({
                clear: true
              })
            }
          }
        })
      },
      handleDelete() {
        this.$refs.udb.remove(this._id, {
          success: (res) => {
            // 删除数据成功后跳转到list页面
            uni.navigateTo({
              url: './list'
            })
          }
        })
      }
    }
  }
</script>

<style>
  .container {
    padding: 10px;
  }

  .btns {
    margin-top: 10px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
  }

  .btns button {
    flex: 1;
  }

  .btn-delete {
    margin-left: 10px;
  }
</style>
