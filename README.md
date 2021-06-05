

# ican-db
> **前因：**
> 有些app数据不是很大，但是数据逻辑却很复杂，读写频率高，如用sqlite手机有时会发烫，改成这种方式后效率有了明显提升。数据的扁平化处理对一个项目来说，好处很多，抛砖引玉，大家可以尝试。

## 安装方法

### 第一步

在 ``main.js`` 中引用

```javascript
import Vue from 'vue'
import App from './App'
//此处添加引用
import DB from 'ican-db'
Vue.prototype.db = DB;
//引用结束
```

在启动引导页中执行初始化
```javascript
//初始化数据
let init = require('ican-db/test/init.js');
let initprc = init(); //这里初始化引导页时用
console.log(initprc);//根据初始化的不同执行不同的业务逻辑
//初始化数据结束
```
> **注意：**
> init.js 需要根据自己的业务逻辑改写，struct.json为数据结构，coins_eth.json为数据内容，这些都需要改成自己的。这三个文件所在的目录也可以换成自己的。

## API

#### chkAutoId 创建表
``@tname String 表名``
```javascript
this.db('tableName').chkAutoId()
```

#### createTable 设置自增长
``@struct Object 表结构``

``@tname String 表名``
```javascript
this.db().createTable(struct, tname)
```
#### copyTable 复制表
``@tname String 目标表名``

``@cname String 源表名``
```javascript
this.db().copyTable(tname, cname)
```
#### getTable 获取表结构

```javascript
this.db('tableName').getTable()
```
#### hasTable 判断表是否存在
``@tname String 表名``
```javascript
let has = this.db('tableName').hasTable()
```
#### select 获取数据列表

```javascript
let list = this.db('tableName')
			   .where({field : 'data'})
			   .select()
```
#### delete 删除数据

```javascript
this.db('tableName')
	.where({field : 'data'})
	.delete()
```
#### save 添加更新数据 add or replace
``@fn String 表结构``

``@tname String 表名``

``@ifinsert Boolean 是否插入新数据``
```javascript
this.db('tableName')
	.save(fn, tname, ifinsert);
```
#### update 更新数据
``@savedata Object 数据[{}]``
```javascript
this.db('tableName')
	.where({})
	.update(data)
```
#### cols 获取某一列
``@field String``
```javascript
let data = this.db('tableName')
		      .where({})
			  .cols(field)
```
#### cols 获取某一行
```javascript
let data = this.db('tableName')
		      .where({})
			  .find()
```
#### value 获取某一值
``@field String``
```javascript
let val = this.db('tableName')
		      .where({})
			  .value(field)
```
#### count 获取总数
```javascript
let num = this.db('tableName')
		      .where({})
			  .count()
```
#### sum 获取总和
``@field String``
```javascript
let num = this.db('tableName')
		      .where({})
			  .sum(field)
```
#### max 获取最大数
``@field String``
```javascript
let num = this.db('tableName')
		      .where({})
			  .max(field)
```
#### min 获取最小数
``@field String``
```javascript
let num = this.db('tableName')
		      .where({})
			  .min(field)
```
#### inserto 查询后插入数据
``@tname String``
```javascript
this.db('tableName')
	.where({})
	.select()
	.inserto(tname)
```
#### insert 插入数据
``@data Object [{}]``
```javascript
this.db('tableName')
	.insert(daga)
```
#### join 联表查询
``@tname String``

``@data Object {}``
```javascript
let data = this.db('tableName')
	           .join(tname, {field : "data"})
			   .select();
```
#### order 排序
``@field String``
``@type String``
```javascript
this.db('tableName')
	.where({where})
	.order(field, 'desc')
	.select()
```
#### page 分页
``@page Number``
``@pagesize Number``
```javascript
this.db('tableName')
	.where({where})
	.select()
	.page(page,pagesize)
```