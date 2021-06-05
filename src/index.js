module.exports = function(tableName = 'coins') {
	function getuid() {
		return Math.floor(Math.random() * 100000000 + 10000000).toString();
	}
	function setStorage(key, data) {
		if(uni && uni.setStorageSync){
			uni.setStorageSync(key, data)
		}else{
			localStorage.setItem(key, JSON.stringify(data))
		}
		
	}
	function getStorage(key) {
		if(uni && uni.getStorageSync){
			return uni.getStorageSync(key)
		}else{
			let data = localStorage.getItem(key);
			return JSON.parse(data);
		}
		
	}
	
	function removeStorage(key) {
		if(uni && uni.removeStorageSync){
			uni.removeStorageSync(key)
		}else{
			localStorage.removeItem(key)
		}
	}
	
	function clearStorage() {
		if(uni && uni.clearStorageSync){
			uni.clearStorageSync();
		}else{
			localStorage.clear()
		}
	}
	function getkey() {
		let mkey = getStorage('rt_systemkey');
		if (!mkey) {
			mkey = getuid();
			setStorage('rt_systemkey', mkey);
		}
		return mkey;
	}

	function getdata(ukey) {
		let syskey = getkey();
		return getStorage(ukey + syskey);
		if (data) {
			return JSON.parse(data)
		}
	}

	function setdata(ukey, data) {
		let syskey = getkey();
		return setStorage(ukey + syskey, data);
	}

	function deldata(ukey) {
		let syskey = getkey();
		removeStorage(ukey + syskey);
	}
	//https://blog.csdn.net/zhaoyu813113552/article/details/54022978
	//函数需要存储
	function objType(obj) {
		let type = {
			'[object Arguments]': "Arguments",
			'[object Array]': "Array",
			'[object Boolean]': "Boolean",
			'[object Date]': "Date",
			'[object Error]': "Error",
			'[object Function]': "Function",
			'[object JSON]': "JSON",
			'[object Math]': "Math",
			'[object Number]': "Number",
			'[object Object]': "Object",
			'[object RegExp]': "RegExp",
			'[object String]': "String"
		};
		let calls = Object.prototype.toString.call(obj);
		return type[calls];
	}
	//this.constructor.objType = objType;
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	function isObject(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	function isBoolean(obj) {
		return Object.prototype.toString.call(obj) === '[object Boolean]';
	}

	function isFunction(obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	}

	function isString(obj) {
		return Object.prototype.toString.call(obj) === '[object String]';
	}

	function isJSON(obj) {
		return Object.prototype.toString.call(obj) === '[object JSON]';
	}

	function checkTime(i) { //将0-9的数字前面加上0，例1变为01 
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}

	function getObjKeys(obj) {
		let rt = [];
		for (let p in obj) {
			rt.push(p);
		}
		return rt;
	}
	const filedType = ['Object', 'Boolean', 'String', 'Function', 'JSON', 'Number', 'auto'];
	const tableStructKey = tableName + '_filed';
	const tableDataKey = tableName + '_data';
	const tableListKey = 'rtwallettablelist';
	//data {fieldname1 : fieldtype,fieldname2 : fieldtype}
	function createTable(struct, tname) {
		let hasauto = false;
		let i = 0;
		let fields = [];
		let autoid = 0;
		let defval = {};
		let fieldtype = {};
		for (let fname in struct) {
			let ftype = struct[fname];
			if (ftype.indexOf("defval") !== -1) {
				let fty = ftype.split(" defval ");
				ftype = fty[0];
				defval[fname] = fty[1];
			} else {
				if (ftype == 'Number') {
					defval[fname] = 0;
				} else if (ftype == 'Object') {
					defval[fname] = {};
				} else if (ftype == 'String') {
					defval[fname] = '';
				} else if (ftype == 'Array') {
					defval[fname] = [];
				}

			}
			fieldtype[fname] = ftype;
			fields.push(fname);
			i++;
		}
		setdata(tname + '_filed', {
			struct,
			fields,
			defval,
			fieldtype,
			autoid,
			len: i
		});
		let tablelist = getdata(tableListKey) || {};
		if (!tablelist[tname]) {
			tablelist[tname] = true;
		}
		setdata(tableListKey, tablelist);

	}

	function hastable(tname) {
		let tablelist = getdata(tableListKey) || {};
		if (!tablelist[tname]) {
			return false;
		} else {
			return true;
		}
	}

	function getTable() {
		return getdata(tableStructKey);
	}
	//[{fieldname:data,fieldname:data},{fieldname:data,fieldname:data}]
	function insertJson(tname, data) {
		let rt = getdata(tname + '_data') || [];
		for (let p in data) {
			rt.push(data[p]);
		}
		setdata(tname + '_data', rt);
	}

	function insertData(data, tname) {
		let tableStruct = getdata(tname + '_filed');
		let rt = getdata(tname + '_data') || [];
		let fieldstruct = tableStruct.struct;
		let feildDef = tableStruct.defval;

		if (isArray(data) && data.length > 0 && isObject(data[0])) {
			let setauto = false;
			let autofield = '';
			for (let p in data) {
				let item = data[p];
				let fp = {};
				for (let fn in fieldstruct) {
					let ftype = fieldstruct[fn];
					let val = item[fn];
					let defv = '';
					if (ftype == 'auto') {
						setauto = true;
						if (val) {
							fp[fn] = val;
							autofield = fn;
							//tableStruct.autoid = val;
						} else {
							fp[fn] = tableStruct.autoid++;
						}

					} else {
						//此处要加类型判断
						if (val) {
							fp[fn] = val;
						} else {
							fp[fn] = feildDef[fn];
						}
					}
				}
				rt.push(fp);
			}
			setdata(tname + '_data', rt);
			if (setauto) {
				if (autofield) {
					let autoarr = [];
					for (let p in rt) {
						autoarr.push(rt[p][autofield]);
					}
					tableStruct.autoid = Math.max.apply(Math, autoarr) + 1;
				}
				setdata(tname + '_filed', tableStruct);
			}

		} else {
			return false;
		}

	}
	return {
		/*
		* 设置自增长
		* @tname String 表名
		**/
		chkAutoId: function() {
			let tkey = tname + '_filed';
			let tableStruct = getdata(tkey);
			let fieldtype = tableStruct.fieldtype;
			let afield = '';
			for (let p in fieldtype) {
				if (fieldtype[p] = 'auto') {
					afield = p;
					break;
				}
			}
			if (afield) {
				let all = this.getdata(tname + '_data');
				let autoarr = [];
				for (let p in all) {
					autoarr.push(all[p][afield]);
				}
				tableStruct.autoid = Math.max.apply(Math, autoarr) + 1;
				setdata(tkey, tableStruct);
			}
		},
		/*
		* 创建表
		* @struct Object 表结构
		* @tname String 表名
		**/
		createTable: function(struct, tname) {
			createTable(struct, tname);
			return this;
		},
		/*
		* 复制表
		* @tname String 目标表名
		* @cname String 源表名
		**/
		copyTable: function(tname, cname) {
			let ns = getdata(tname + '_filed');
			if(!ns) {
				let data = getdata(cname + '_filed');
				//console.log(data)
				createTable(data.struct, tname);
			}
		},
		/*
		* 获取表结构
		**/
		getTable: function() {
			return getTable();
		},
		/*
		* 判断表是否存在
		* @tname String 表名
		**/
		hasTable: function(tname) {
			return hastable(tname);
		},
		setdata: function(k, v) {
			setdata(k, v);
			return this;
		},
		getdata: function(k) {
			return getdata(k);
		},
		deldata: function(k) {
			deldata(k);
			return this;
		},
		/*
		* 获取数据列表
		**/
		select: function() {
			return this.fetch();
		},
		data: function() {
			return getdata(tableDataKey);
		},
		/*
		* 删除数据
		**/
		delete: function() {
			let wherekeys = this.wherekey();
			let all = this.data();
			if (wherekeys.length > 0) {
				for (let p in all) {
					let item = all[p];
					var can = false;
					for (let i in item) {
						if (this.where[i] == item[i]) {
							can = true;
						}
					}
					if (can) {
						delete all[p];
					}
				}
			} else {
				all = [];
			}
			setdata(tableDataKey, all);
			return this;
		},
		//savedata [{},{}]
		/*
		* 添加更新数据 add or replace
		* @fn String 表结构
		* @tname String 表名
		* @ifinsert Boolean 是否插入新数据
		**/
		save: function(fn, savedata, ifinsert = false) {
			let all = this.data();
			if(all.length < 1){
				this.insert(savedata);
				return this;
			}
			let cids = [];
			for (let p in all) {
				let item = all[p];
				var cid = -1;
				for (let s in savedata) {
					if (item[fn] == savedata[s][fn]) {
						cid = s;
					}
				}
				if (cid > -1) {
					for (let f in savedata[cid]) {
						all[p][f] = savedata[cid][f];
					}
					cids.push(cid);
				}
			}
			//console.log(all)
			if (ifinsert === true && cids.length > 0) {
				for (let p in savedata) {
					if(cids.indexOf(p) === -1){
						all.push(savedata[p])
					}
				}
				
			}
			setdata(tableDataKey, all);
			return this;
		},
		/*
		* 更新数据
		* @savedata Object 数据[{}]
		**/
		update: function(savedata) {
			let wherekeys = this.wherekey();
			let all = this.data();
			if (wherekeys.length > 0) {
				for (let p in all) {
					let item = all[p];
					let can = this._checkcan(item);
					if (can) {
						for (let s in savedata) {
							all[p][s] = savedata[s];
						}
					}
				}
			} else {
				for (let p in all) {
					let item = all[p];
					for (let s in savedata) {
						all[p][s] = savedata[s];
					}
				}
			}
			setdata(tableDataKey, all);
			return this;
		},
		_checkcan: function(item) {
			let wh = this._where;
			let can = true;
			for (let w in wh) {
				if (isArray(wh[w])) {
					if (wh[w][0] == '<' && item[w] >= wh[w][1]) {
						can = false;
					} else if (wh[w][0] == '>' && item[w] <= wh[w][1]) {
						can = false;
					} else if (wh[w][0] == '!=' && item[w] == wh[w][1]) {
						can = false;
					} else if (wh[w][0] == 'in' && wh[w][1].indexOf(wh[w][1]) === -1) {
						can = false;
					}
				} else {
					if (wh[w] != item[w]) {
						can = false;
					}
				}
				if (!can) {
					break;
				}
			}
			return can;
		},
		/*
		* 取数据
		**/
		fetch: function() {
			let wherekeys = this.wherekey();
			let rt = [];
			let all = this.data();
			if (wherekeys.length > 0) {
				for (let p in all) {
					let item = all[p];
					let can = this._checkcan(item);
					if (can) {
						rt.push(item);
					}
				}
			} else {
				rt = all;
			}
			if (this._orderkey.length > 0) {
				let sk = this._orderkey;
				if (this._ordertype == 'desc') {
					rt.sort(function(x, y) {
						if (!isNaN(x[sk]) && !isNaN(y[sk])) {
							x[sk] = x[sk] * 1;
							y[sk] = y[sk] * 1;
						} else if (isString(x[sk]) && isString(y[sk])) {
							x[sk] = x[sk].toUpperCase();
							y[sk] = y[sk].toUpperCase();
						}

						if (x[sk] < y[sk]) {
							return 1;
						}
						if (x[sk] > y[sk]) {
							return -1;
						}
						return 0;
					})
				} else {
					//console.log(rt[0]['name'])
					rt.sort(function(x, y) {
						if (!isNaN(x[sk]) && !isNaN(y[sk])) {
							x[sk] = x[sk] * 1;
							y[sk] = y[sk] * 1;
						} else if (isString(x[sk]) && isString(y[sk])) {
							x[sk] = x[sk].toUpperCase();
							y[sk] = y[sk].toUpperCase();
						}

						if (x[sk] < y[sk]) {
							return -1;
						}
						if (x[sk] > y[sk]) {
							return 1;
						}
						return 0;

					})
					//console.log(rt[0]['name'])
				}
			}
			if (this._pagesize > 0) {
				let end = (this._pagenum + 1) * this._pagesize;
				//let start = this._pagenum * this._pagesize;
				if(end < 1){
					end = this._pagesize;
				}
				
				if(end > rt.length){
					end = rt.length;
				};
				//console.log(end)
				rt = rt.slice(0, end);
				//let start = this._pagenum * this._pagesize;
				//rt = rt.slice(start, end);
			}
			if (this._fields.length > 0) {
				let ct = [];
				for (let p in rt) {
					let item = rt[p];
					let cf = {};
					for (let i in item) {
						if (this._fields.indexOf(i) !== -1) {
							cf[i] = item[i];
						}
					}
					ct.push(cf);
				}
				rt = ct;
			}
			if (this._joinfield.length > 0 && this._joindata.length > 0) {
				let jf = this._joinfield;
				let jd = this._joindata;
				let jt = {};
				for (let p in jd) {
					let k = jd[p][jf];
					jt[k] = jd[p];
				}
				for (let r in rt) {
					let item = rt[r];
					let k = item[jf];
					if (jt[k]) {
						for (let t in jt[k]) {
							rt[r]['join_' + t] = jt[k][t];
						}
					}

				}
			}
			return rt;
		},

		/*
		* 获取某一列
		* @field String
		**/
		cols: function(field) {
			let res = this.fetch();
			let rt = [];
			if (res && res.length > 0) {
				for (let p in res) {
					res[p][field] && rt.push(res[p][field]);
				}
			}
			return rt;
		},
		/*
		* 获取某一行
		**/
		find: function() {
			let data = this.fetch();
			return data[0] ? data[0] : false;
		},
		/*
		* 获取某一值
		* @field String
		**/
		value: function(field) {
			let data = this.find();
			if (!data) {
				return false;
			}
			if (field.indexOf(",") === -1) {
				return data[field];
			} else {
				var rt = {};
				var arr = field.split(",");
				for (var i in arr) {
					var fd = arr[i];
					rt[fd] = data[fd];
				}
				return rt;
			}
		},
		/*
		* 获取总数
		**/
		count: function() {
			let all = this.fetch();
			return all.length;
		},
		/*
		* 获取总和
		* @field String
		**/
		sum: function(field) {
			let rt = 0;
			let all = this.fetch();
			for (let p in all) {
				rt += all[p][field] * 1;
			}
			return rt;
		},
		/*
		* 获取最大数
		* @field String
		**/
		max: function(field) {
			let autoarr = [];
			let all = this.fetch();
			for (let p in all) {
				autoarr.push(all[p][field]);
			}
			return Math.min.apply(Math, autoarr);
		},
		/*
		* 获取最小数
		* @field String
		**/
		min: function(field) {
			let autoarr = [];
			let all = this.fetch();
			for (let p in all) {
				autoarr.push(all[p][field]);
			}
			return Math.max.apply(Math, autoarr);
		},
		/*
		* 查询后插入数据
		* @tname String
		* @eg db('tabname').where({}).select().inserto(tname);
		**/
		inserto: function(tname) {
			let data = this.fetch();
			insertData(data, tname);
			return data;
		},
		/*
		* 插入数据
		* @data Object
		**/
		insert: function(data) {
			insertData(data, tableName);
			return this;
		},
		/*
		* 插入json数据
		* @tname Sring
		* @data Object
		**/
		insertJson: function(tname, data) {
			insertJson(tname, data);
			return this;
		},
		_fields: [],
		fields: function(farr) {
			this._fields = farr;
		},
		_joinfield: '',
		_joindata: [],
		/*
		* 联表查询
		* @tname Sring
		* @data Object
		**/
		join: function(field, jdata) {
			this._joinfield = field;
			this._joindata = jdata;
			return this;
		},
		_where: {},
		wherekey: function() {
			return getObjKeys(this._where);
		},
		/*
		* 搜索条件
		* @where Object
		**/
		where: function(where) {
			if (isObject(where)) {
				this._where = where;
			}
			return this;
		},
		_orderkey: '',
		_ordertype: 'desc',
		/*
		* 排序
		* @field String
		* @type String
		**/
		order: function(field, type = "desc") {
			this._orderkey = field;
			this._ordertype = type;
			return this;
		},
		_pagenum: 0,
		_pagesize: 0,
		/*
		* 分页
		* @page Number
		* @pagesize Number
		**/
		page: function(page = 0, pagesize = 20) {
			//if(page > 0) page = page - 1;
			this._pagenum = page;
			this._pagesize = pagesize;
			return this;
		},
		/*
		* 清空表
		**/
		clear: function() {
			deldata(tableDataKey)
		},
		/*
		* 删除表
		**/
		drop: function() {
			this.clear(tableStructKey);
			deldata(tableDataKey);
			let tablelist = getdata(tableListKey) || {};
			if (tablelist[tablename]) {
				delete tablelist[tablename];
			}
			setdata(tableListKey, tablelist);
		},
		/*
		* 清除所有数据
		**/
		setnull: function() {
			clearStorage();
		},
		clearTable: function(tn) {
			deldata(tn + '_data');
		},
		//工具
		typeis: function(obj) {
			return objType(obj);
		},
		getuid : function() {
			return getuid();
		},
 		getnow: function() {
			//获取js 时间戳
			let time = new Date().getTime();
			//去掉 js 时间戳后三位，与php 时间戳保持一致
			return parseInt(time / 1000);
		},
		chktime: function(ctime, vtime) {
			if (!ctime || this.getnow() - ctime > vtime) {
				return true;
			} else {
				return false;
			}

		},

		getdate: function(date) {
			var date = new Date(parseInt(date) * 1000);
			var hours = checkTime(date.getHours()) + ':' + checkTime(date.getMinutes()) + ':' + checkTime(date.getSeconds());
			return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ' ' + hours;
		}
	};

}
