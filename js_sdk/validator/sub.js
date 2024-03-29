// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "user_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "订阅用户ID",
    "label": "订阅用户ID"
  },
  "openid": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "订阅用户openID",
    "label": "订阅用户openID"
  },
  "template_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "订阅模版ID",
    "label": "订阅模版ID"
  },
  "order_no": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "订单业务号",
    "label": "订单业务号"
  },
  "user_order_success": {
    "rules": [
      {
        "format": "bool"
      }
    ],
    "label": "支付是否成功"
  },
  "total_fee": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "支付金额",
    "label": "支付金额"
  },
  "sub_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "title": "订阅时间",
    "label": "订阅时间"
  },
  "product_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "商品ID",
    "label": "商品ID"
  },
  "product_name": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "商品名称",
    "label": "商品名称"
  },
  "sub_content": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "发送内容",
    "label": "发送内容"
  },
  "sub_status": {
    "rules": [
      {
        "format": "bool"
      }
    ],
    "title": "是否已发送（不用手动修改）",
    "defaultValue": false,
    "label": "是否已发送（不用手动修改）"
  }
}

const enumConverter = {}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
