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
	getUserName: function(cmp) {

		var action = cmp.get("c.getUserName");

		action.setCallback(this, function(response) {

			if (response.getState() === "SUCCESS") {

				cmp.set("v.userName", response.getReturnValue());
	        } 
	        else if (response.getState() === "ERROR") {
	       		
	            var errors = response.getError();

	            console.error("Server Error: ", errors);
	        }
		});

		$A.enqueueAction(action);
	},

	//get account records from server
	getAccounts: function(cmp, callback) {

		var action = cmp.get("c.getAccounts");

		action.setCallback(this, function(response) {

			if (response.getState() === "SUCCESS") {

				var data = response.getReturnValue();

				cmp.set("v.accounts", JSON.parse(data));
				

				//helper.setDataTableAttributes(cmp); //1


				//callback(cmp); //2.a  --does not work, since callback will be executed in a global context

				//callback.call(this, cmp); //2.b  --this will work, since you are setting "this" = helper explicitly


				callback(); //3.a --this will work because callback method does not access "this"

				//callback.call(this, cmp); //3.b  --this will also work because callback method does not access "this"

	        } 
	        else if (response.getState() === "ERROR") {
	       		
	            var errors = response.getError();

	            console.error("Server Error: ", errors);
	        }
		});

		$A.enqueueAction(action);
	},

	//set data table attributes - columns and rows
	setDataTableAttributes: function(cmp){

		cmp.set("v.columns", this.DATA_TABLE_COLUMNS); //expecting "this" to be helper

		var rows = cmp.get("v.accounts");

		cmp.set("v.rows", rows);
	},

	//filter rows that includes keyword
	performSearch: function(cmp, keyword){

		keyword = keyword.toLowerCase().trim();

		var filteredRows = [];

		var rows = cmp.get("v.accounts");

		var columns = this.DATA_TABLE_COLUMNS;

		for(var i = 0; i < rows.length; i++){

			var row = rows[i];

			for(var j = 0; j < columns.length; j++){

				var column = columns[j];

				var columnValue = row[column.fieldName];

				if(columnValue && String(columnValue).toLowerCase().trim().includes(keyword)){

					filteredRows.push(row);
					break;
				}
			}
		}

		cmp.set("v.rows", filteredRows);
	}
})