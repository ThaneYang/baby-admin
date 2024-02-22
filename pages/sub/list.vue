<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <view class="uni-title"></view>
        <view class="uni-sub-title"></view>
      </view>
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
        <button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db ref="udb" :collection="collectionList" field="user_id,openid,template_id,order_no,user_order_success,total_fee,sub_date,product_id,product_name,sub_content,sub_status" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'user_id')" sortable @sort-change="sortChange($event, 'user_id')">订阅用户ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'openid')" sortable @sort-change="sortChange($event, 'openid')">订阅用户openID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'template_id')" sortable @sort-change="sortChange($event, 'template_id')">订阅模版ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'order_no')" sortable @sort-change="sortChange($event, 'order_no')">订单业务号</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'user_order_success')">支付是否成功</uni-th>
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'total_fee')" sortable @sort-change="sortChange($event, 'total_fee')">支付金额</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'sub_date')" sortable @sort-change="sortChange($event, 'sub_date')">订阅时间</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'product_id')" sortable @sort-change="sortChange($event, 'product_id')">商品ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'product_name')" sortable @sort-change="sortChange($event, 'product_name')">商品名称</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'sub_content')" sortable @sort-change="sortChange($event, 'sub_content')">发送内容</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'sub_status')">是否已发送（不用手动修改）</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
            <uni-td align="center">{{item.user_id}}</uni-td>
            <uni-td align="center">{{item.openid}}</uni-td>
            <uni-td align="center">{{item.template_id}}</uni-td>
            <uni-td align="center">{{item.order_no}}</uni-td>
            <uni-td align="center">{{item.user_order_success == true ? '✅' : '❌'}}</uni-td>
            <uni-td align="center">{{item.total_fee}}</uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.sub_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">{{item.product_id}}</uni-td>
            <uni-td align="center">{{item.product_name}}</uni-td>
            <uni-td align="center">{{item.sub_content}}</uni-td>
            <uni-td align="center">{{item.sub_status == true ? '✅' : '❌'}}</uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>
  </view>
</template>

<script>
  import { enumConverter, filterToWhere } from '../../js_sdk/validator/sub.js';

  const db = uniCloud.database()
  // 表查询配置
  const dbOrderBy = '' // 排序字段
  const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20
  const pageCurrent = 1

  const orderByMapping = {
    "ascending": "asc",
    "descending": "desc"
  }

  export default {
    data() {
      return {
        collectionList: "sub",
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: "",
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {},
          ...enumConverter
        },
        imageStyles: {
          width: 64,
          height: 64
        },
        exportExcel: {
          "filename": "sub.xls",
          "type": "xls",
          "fields": {
            "订阅用户ID": "user_id",
            "订阅用户openID": "openid",
            "订阅模版ID": "template_id",
            "订单业务号": "order_no",
            "支付是否成功": "user_order_success",
            "支付金额": "total_fee",
            "订阅时间": "sub_date",
            "商品ID": "product_id",
            "商品名称": "product_name",
            "发送内容": "sub_content",
            "是否已发送（不用手动修改）": "sub_status"
          }
        },
        exportExcelData: []
      }
    },
    onLoad() {
      this._filter = {}
    },
    onReady() {
      this.$refs.udb.loadData()
    },
    methods: {
      onqueryload(data) {
        this.exportExcelData = data
      },
      getWhere() {
        const query = this.query.trim()
        if (!query) {
          return ''
        }
        const queryRe = new RegExp(query, 'i')
        return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
      },
      search() {
        const newWhere = this.getWhere()
        this.where = newWhere
        this.$nextTick(() => {
          this.loadData()
        })
      },
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear
        })
      },
      onPageChanged(e) {
        this.selectedIndexs.length = 0
        this.$refs.table.clearSelection()
        this.$refs.udb.loadData({
          current: e.current
        })
      },
      navigateTo(url, clear) {
        // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
        uni.navigateTo({
          url,
          events: {
            refreshData: () => {
              this.loadData(clear)
            }
          }
        })
      },
      // 多选处理
      selectedItems() {
        var dataList = this.$refs.udb.dataList
        return this.selectedIndexs.map(i => dataList[i]._id)
      },
      // 批量删除
      delTable() {
        this.$refs.udb.remove(this.selectedItems(), {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      // 多选
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order]
        } else {
          this.orderby = ''
        }
        this.$refs.table.clearSelection()
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      },
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter
        }
        let newWhere = filterToWhere(this._filter, db.command)
        if (Object.keys(newWhere).length) {
          this.where = newWhere
        } else {
          this.where = ''
        }
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      }
    }
  }
</script>

<style>
</style>
