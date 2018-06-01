({
	//init component data
	doInit: function(cmp, event, helper) {

		helper.getUserName(cmp); //independent

		//dependent - setDataTableAttributes depends on getAccounts

		//helper.getAccounts(cmp); //1

		//helper.getAccounts(cmp, helper.setDataTableAttributes); //2

		helper.getAccounts(cmp, function(){ //3

			helper.setDataTableAttributes(cmp);
		});
	},

	//perform search on data table rows
	performSearch: function(cmp, event, helper){

		var keyword = event.getParam("value");

		if(!$A.util.isEmpty(keyword)){

			helper.performSearch(cmp, keyword);
			
		} else {

			cmp.set("v.rows", cmp.get("v.accounts"));
		}
	}
})