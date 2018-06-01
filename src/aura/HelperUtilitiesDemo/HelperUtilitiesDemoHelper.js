({
	//global helper variables
	DATA_TABLE_COLUMNS: [
		{ label: 'Name', fieldName: 'Name', type: 'text'},
		{ label: 'Type', fieldName: 'Type', type: 'text'},
		{ label: 'Industry', fieldName: 'Industry', type: 'text'},
		{ label: 'Rating', fieldName: 'Rating', type: 'text'},
		{ label: 'AnnualRevenue', fieldName: 'AnnualRevenue', type: 'currency'},
		{ label: 'Phone', fieldName: 'Phone', type: 'phone'}
	],

	//get user name from server
	getUserName: function(cmp, resolve, reject) {

		var handler = this.partial(this.setUserName, cmp, this, resolve);

		this.executeServerAction(cmp, "getUserName", {}, true, handler, reject);
	},

	//set component user name attribute
	setUserName: function(cmp, userName, resolve){

		if(!this.isString(userName)){

			userName = '';
		}

		cmp.set("v.userName", userName);

		if(this.isFunction(resolve)){

			resolve();
		}
	},

	//get account records from server
	getAccounts: function(cmp, resolve, reject) {

		var handler = this.partial(this.setAccounts, cmp, this, resolve);

		this.executeServerAction(cmp, "getAccounts", {}, true, handler, reject);
	},

	//set component accounts attribute
	setAccounts: function(cmp, accounts, resolve){

		if(this.isString(accounts)){

			accounts = this.parseJSON(accounts, []);
		}

		if(!this.isArray(accounts)){

			accounts = [];
		}

		//accounts = this.ensureArray(accounts);

		cmp.set("v.accounts", accounts);

		if(this.isFunction(resolve)){

			resolve();
		}
	},

	//set data table attributes - columns and rows
	setDataTableAttributes: function(cmp){

		cmp.set("v.columns", this.DATA_TABLE_COLUMNS);

		var rows = cmp.get("v.accounts");

		cmp.set("v.rows", rows);
	},

	//filter rows that includes keyword
	performSearch: function(cmp, keyword){

		keyword = keyword.toLowerCase().trim();

		var rows = cmp.get("v.accounts");

		var filteredRows = this.filter(rows, function(row, rowIndex){

			var matchedColumn = this.find(this.DATA_TABLE_COLUMNS, function(column, columnIndex){

				var columnValue = row[column.fieldName];

				if(this.isNotEmpty(columnValue)){

					if(!this.isString(columnValue)){

						columnValue = String(columnValue);
					}

					columnValue = columnValue.toLowerCase();

					if(columnValue.includes(keyword)){

						return true;
					}
				}

				return false;
			});

			var rowDecision = this.isNotEmpty(matchedColumn);

			return rowDecision;
		});

		cmp.set("v.rows", filteredRows);
	},

	//filter rows that includes keyword
	performAdvancedSearch: function(cmp, keyword){

		keyword = keyword.toLowerCase().trim();

		var rows = cmp.get("v.accounts");

		var filterIterator = this.compose(
			this.isNotEmpty, 
			this.partial(this.find, this.DATA_TABLE_COLUMNS), 
			this.partial(this.partial, this.searchIterator, this, this, keyword),
			this.identity
		);

		var filteredRows = this.filter(rows, filterIterator);

		cmp.set("v.rows", filteredRows);
	},

	searchIterator: function(row, column, keyword){

		var columnValue = row[column.fieldName];

		if(this.isNotEmpty(columnValue)){

			if(!this.isString(columnValue)){

				columnValue = String(columnValue);
			}

			columnValue = columnValue.toLowerCase();

			if(columnValue.includes(keyword)){

				return true;
			}
		}

		return false;
	},

	//this method fires an async call to server
	executeServerAction: function(cmp, method, params, storable, callback){

		var action = cmp.get("c." + method);

		if(this.isNotEmpty(action)){

			if(this.isObject(params) && this.isNotEmpty(params)){

				action.setParams(params);
			}

			action.setCallback(this, function(repsonse) {

				this.handleServerResponse(repsonse, callback);
			});

			if(this.isBoolean(storable)) {

				action.setStorable(storable);
			}

			$A.enqueueAction(action);
		}
	},

	//parse server response for return value or an error
	handleServerResponse: function(response, callback){

		if (response.getState() === "SUCCESS") {

			if(this.isFunction(callback)){

				callback.call(this, response.getReturnValue());
			}
        } 
        else if (response.getState() === "ERROR") {
       		
            var errors = response.getError();

            var message = 'Unknown error'; 

            if (this.isArray(errors) && this.isNotEmpty(errors)) {

                message = errors[0].message;
            }

            console.error("Server Error: ", message);
        }
	}
})