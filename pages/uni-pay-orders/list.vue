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
      <unicloud-db ref="udb" :collection="collectionList" field="provider,provider_pay_type,uni_platform,status,type,order_no,out_trade_no,transaction_id,user_id,device_id,client_ip,openid,description,err_msg,total_fee,refund_fee,refund_count,refund_list,provider_appid,appid,user_order_success,pay_date,notify_date,cancel_date" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.provider_localdata" @filter-change="filterChange($event, 'provider')">支付供应商</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'provider_pay_type')" sortable @sort-change="sortChange($event, 'provider_pay_type')">支付方式</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'uni_platform')" sortable @sort-change="sortChange($event, 'uni_platform')">应用平台</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.status_localdata" @filter-change="filterChange($event, 'status')">订单状态</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'type')" sortable @sort-change="sortChange($event, 'type')">订单类型</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'order_no')" sortable @sort-change="sortChange($event, 'order_no')">业务系统订单号</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'out_trade_no')" sortable @sort-change="sortChange($event, 'out_trade_no')">支付插件订单号</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'transaction_id')" sortable @sort-change="sortChange($event, 'transaction_id')">交易单号</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'user_id')">用户ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'device_id')" sortable @sort-change="sortChange($event, 'device_id')">device_id</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'client_ip')" sortable @sort-change="sortChange($event, 'client_ip')">客户端IP</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'openid')" sortable @sort-change="sortChange($event, 'openid')">openid</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'description')" sortable @sort-change="sortChange($event, 'description')">支付描述</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'err_msg')" sortable @sort-change="sortChange($event, 'err_msg')">支付失败原因</uni-th>
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'total_fee')" sortable @sort-change="sortChange($event, 'total_fee')">订单总金额</uni-th>
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'refund_fee')" sortable @sort-change="sortChange($event, 'refund_fee')">订单总退款金额</uni-th>
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'refund_count')" sortable @sort-change="sortChange($event, 'refund_count')">当前退款笔数</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'refund_list')">退款详情</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'provider_appid')" sortable @sort-change="sortChange($event, 'provider_appid')">开放平台appid</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'appid')" sortable @sort-change="sortChange($event, 'appid')">DCloud AppId</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'user_order_success')">回调状态</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'pay_date')" sortable @sort-change="sortChange($event, 'pay_date')">支付时间</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'notify_date')" sortable @sort-change="sortChange($event, 'notify_date')">异步通知时间</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'cancel_date')" sortable @sort-change="sortChange($event, 'cancel_date')">取消时间</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
            <uni-td align="center">{{options.provider_valuetotext[item.provider]}}</uni-td>
            <uni-td align="center">{{item.provider_pay_type}}</uni-td>
            <uni-td align="center">{{item.uni_platform}}</uni-td>
            <uni-td align="center">{{options.status_valuetotext[item.status]}}</uni-td>
            <uni-td align="center">{{item.type}}</uni-td>
            <uni-td align="center">{{item.order_no}}</uni-td>
            <uni-td align="center">{{item.out_trade_no}}</uni-td>
            <uni-td align="center">{{item.transaction_id}}</uni-td>
            <uni-td align="center">{{item.user_id}}</uni-td>
            <uni-td align="center">{{item.device_id}}</uni-td>
            <uni-td align="center">{{item.client_ip}}</uni-td>
            <uni-td align="center">{{item.openid}}</uni-td>
            <uni-td align="center">{{item.description}}</uni-td>
            <uni-td align="center">{{item.err_msg}}</uni-td>
            <uni-td align="center">{{item.total_fee}}</uni-td>
            <uni-td align="center">{{item.refund_fee}}</uni-td>
            <uni-td align="center">{{item.refund_count}}</uni-td>
            <uni-td align="center">{{item.refund_list}}</uni-td>
            <uni-td align="center">{{item.provider_appid}}</uni-td>
            <uni-td align="center">{{item.appid}}</uni-td>
            <uni-td align="center">{{item.user_order_success == true ? '✅' : '❌'}}</uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.pay_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.notify_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.cancel_date"></uni-dateformat>
            </uni-td>
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
  import { enumConverter, filterToWhere } from '../../js_sdk/validator/uni-pay-orders.js';

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
        collectionList: "uni-pay-orders",
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: "",
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {
            "provider_localdata": [
              {
                "text": "微信支付",
                "value": "wxpay"
              },
              {
                "text": "支付宝",
                "value": "alipay"
              },
              {
                "text": "苹果应用内支付",
                "value": "appleiap"
              }
            ],
            "status_localdata": [
              {
                "text": "已关闭",
                "value": -1
              },
              {
                "text": "未支付",
                "value": 0
              },
              {
                "text": "已支付",
                "value": 1
              },
              {
                "text": "已部分退款",
                "value": 2
              },
              {
                "text": "已全额退款",
                "value": 3
              }
            ]
          },
          ...enumConverter
        },
        imageStyles: {
          width: 64,
          height: 64
        },
        exportExcel: {
          "filename": "uni-pay-orders.xls",
          "type": "xls",
          "fields": {
            "支付供应商": "provider",
            "支付方式": "provider_pay_type",
            "应用平台": "uni_platform",
            "订单状态": "status",
            "订单类型": "type",
            "业务系统订单号": "order_no",
            "支付插件订单号": "out_trade_no",
            "交易单号": "transaction_id",
            "用户ID": "user_id",
            "device_id": "device_id",
            "客户端IP": "client_ip",
            "openid": "openid",
            "支付描述": "description",
            "支付失败原因": "err_msg",
            "订单总金额": "total_fee",
            "订单总退款金额": "refund_fee",
            "当前退款笔数": "refund_count",
            "退款详情": "refund_list",
            "开放平台appid": "provider_appid",
            "DCloud AppId": "appid",
            "回调状态": "user_order_success",
            "支付时间": "pay_date",
            "异步通知时间": "notify_date",
            "取消时间": "cancel_date"
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
