/*------------------------------------------------------------------------------------
Author:        Sumit Gupta
Company:       Salesforce
Description:   Apex controller for helper utilities demo component

History
Date            Author             Comments
--------------------------------------------------------------------------------------
23-05-2018     Sumit Gupta       	Initial Release
------------------------------------------------------------------------------------*/

public with sharing class HelperUtilitiesDemoController {

	//server action to get current user name
	@AuraEnabled public static String getUserName(){

        //get user name from UserInfo class or you can query user record too
    	String userName = UserInfo.getFirstName();

    	//return user name
    	return userName;
    }

    //server action to fetch account records
    @AuraEnabled public static String getAccounts(){
    	
	    //query records from account object 
		List<Account> accounts = [
			SELECT Name, Type, Industry, Rating, AnnualRevenue, Phone 
			FROM Account LIMIT 1000
		];

		//return records string
		return JSON.serialize(accounts);
    }

}