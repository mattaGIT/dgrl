@isTest
private class SL_Test_DGRL_Extension {

    @TestSetup
    static void setup(){
        Account acct = new Account(Name = 'DGRLTestAcct');
        Contact contact = new Contact(LastName = 'Tester');
    
        insert new List<SObject>{acct, contact};

        OpportunityStage oppStage = [SELECT MasterLabel FROM OpportunityStage LIMIT 1];

        AccountContactRole acctRole = new AccountContactRole(AccountId = acct.Id, ContactId = contact.Id);
        Opportunity opp = new Opportunity(Name = 'TestOpp', AccountId = acct.Id, CloseDate = Date.today(), StageName = oppStage.MasterLabel);

        insert new List<sObject>{acctRole, opp};

        OpportunityContactRole oppRole = new OpportunityContactRole(OpportunityId = opp.Id, ContactId = contact.Id);

        DGRL__c customSetting = new DGRL__C(Object_with_Grid__c = 'Account',
                                            Primary_Related_Object__c = 'AccountContactRole',
                                            Primary_Related_Object_Relation_Field__c = 'AccountId',
                                            Secondary_Related_Object__c = 'OpportunityContactRole',
                                            Secondary_Related_Object_Relation_Field__c = 'ContactId',
                                            Primary_Group_Field__c = 'AccountId',
                                            Secondary_Group_Field__c = 'OpportunityId');
    }
	
	@isTest static void test_method_one() {
        Account accountWithPage = [SELECT Id FROM Account WHERE Name = 'DGRLTestAcct' LIMIT 1];
        
        PageReference pr = Page.SL_DGRL_Account;
        pr.getParameters().put('Id', accountWithPage.Id);
        Test.setCurrentPage(pr);

		ngForceController ngForceCtrl = new ngForceController();
        SL_DGRL_Extension ctrl = new SL_DGRL_Extension(ngForceCtrl);
	}
	
}