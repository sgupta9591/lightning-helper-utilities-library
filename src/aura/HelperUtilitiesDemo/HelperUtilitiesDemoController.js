({
	//init component data
	doInit: function(cmp, event, helper) {

		var asyncProcess = helper.async(); //async method is part of promises utilities methods and sync async methods execution


		var getUserNamePromise = helper.promise(function(resolve, reject){
			
			helper.getUserName(cmp, resolve, reject);
		}); 

		asyncProcess.push(getUserNamePromise); //push the returned promise to the process so that it will be tracked



		var getAccountsPromise = helper.promise(function(resolve, reject){

			helper.getAccounts(cmp, resolve, reject);
		}); 

		asyncProcess.push(getAccountsPromise); //push this returned promise also to the process so that it will be tracked



		var processTracker = asyncProcess.execute(); //now start the tracking process

		processTracker.then(function() { //all aync methods have returned data

			console.log("Data initialisation is done!!");

			helper.setDataTableAttributes(cmp);

		});

		processTracker.catch(function(error) {

			console.error("Something went wrong!!", error);

		});
	},

	//perform search on data table rows
	performSearch: function(cmp, event, helper){

		var keyword = event.getParam("value");

		if(helper.isString(keyword) && helper.isNotEmpty(keyword)){

			helper.performSearch(cmp, keyword);

			//helper.performAdvancedSearch(cmp, keyword);
			
		} else {

			cmp.set("v.rows", cmp.get("v.accounts"));
		}
	}
})