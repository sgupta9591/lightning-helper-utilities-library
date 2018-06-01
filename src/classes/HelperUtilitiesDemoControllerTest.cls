/*------------------------------------------------------------------------------------
Author:        Sumit Gupta
Company:       Salesforce
Description:   test class for helper utilities demo lightning component 

History
Date            Author             Comments
--------------------------------------------------------------------------------------
23-03-2018     Sumit Gupta       	Initial Release
------------------------------------------------------------------------------------*/
@isTest
private class HelperUtilitiesDemoControllerTest {
	
	@isTest static void test_ServerActions() {
		String userName = HelperUtilitiesDemoController.getUserName();
		String accounts = HelperUtilitiesDemoController.getAccounts();
		System.assertNotEquals(null, userName);
		System.assertNotEquals(null, accounts);
	}
}