public with sharing class SL_DGRL_Extension {

    public transient String objectId                 {get;set;}
    public transient String objectName               {get;set;}
    public static String baseURL    {get;set;}

    public transient String Grouping_1_Field      {get;set;}
    public transient String Grouping_1_Field_Set  {get;set;}
    public transient String Grouping_1_Object         {get;set;}
    public transient String Grouping_1_Parent_Field    {get;set;} 

    public transient String Grouping_2_Field      {get;set;}
    public transient String Grouping_2_Field_Set  {get;set;}
    public transient String Grouping_2_Object         {get;set;}
    public transient String Grouping_2_Parent_Field    {get;set;}



    public SL_DGRL_Extension() { 
        Id currentId = ApexPages.currentPage().getParameters().get('id');
        objectName = currentId.getSobjectType().getDescribe().getName();

        objectId = currentId; // Dynamic SOQL expects quotes

        DGRL_Settings__mdt DGRLsettings = [SELECT Grouping_1_Field__c, 
                                     Grouping_1_Field_Set__c,
                                     Grouping_1_Object__c,
                                     Grouping_1_Parent_Field__c,
                                     Grouping_2_Field__c,
                                     Grouping_2_Field_Set__c,
                                     Grouping_2_Object__c,
                                     Grouping_2_Parent_Field__c,
                                     Object_with_Grid__c
                                  FROM DGRL_Settings__mdt
                                  WHERE Object_with_Grid__c = :objectName
                                  LIMIT 1];
        Grouping_1_Field = DGRLsettings.Grouping_1_Field__c; 
        Grouping_1_Field_Set = DGRLsettings.Grouping_1_Field_Set__c;  
        Grouping_1_Object = DGRLsettings.Grouping_1_Object__c;  
        Grouping_1_Parent_Field = DGRLsettings.Grouping_1_Parent_Field__c;  
        Grouping_2_Field = DGRLsettings.Grouping_2_Field__c;  
        Grouping_2_Field_Set = DGRLsettings.Grouping_2_Field_Set__c;  
        Grouping_2_Object = DGRLsettings.Grouping_2_Object__c;
        Grouping_2_Parent_Field = DGRLsettings.Grouping_2_Parent_Field__c;        
        
        baseURL = URL.getSalesforceBaseUrl().toExternalForm();
        baseURL = baseURL.replace('visual.','my.sales').replace('--c.','.').replace('--n.','.');

        //"https://nbhnw--r3dev--c.cs17.visual.force.com"
        //.replace('visual.','sales').replace('--c.','.')
    }

    public String[] getFieldTypeAndObj(String field, String[] potentialObjs){
        Schema.DescribeSObjectResult[] results = Schema.describeSObjects(potentialObjs);

        for(Schema.DescribeSObjectResult res : results){
            if(res.fields.getMap().containsKey(field)){
                return new List<String>{res.getName(), res.fields.getMap().get(field).getDescribe().getType() + ''};
            }
        }

        return null;
    }
}