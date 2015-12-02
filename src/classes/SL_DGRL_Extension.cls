public with sharing class SL_DGRL_Extension {

    public transient String objectId                 {get;set;}
    public transient String objectName               {get;set;}

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

        objectId = '\''+currentId+'\''; // Dynamic SOQL expects quotes

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
        //if(settings.size() > 0){
        //    primaryRelated = settings[0].Primary_Related_Object__c;
        //    primaryRelatedField = settings[0].Primary_Related_Object_Relation_Field__c;
        //    secondaryRelated = settings[0].Secondary_Related_Object__c;
        //    secondaryRelatedField = settings[0].Secondary_Related_Object_Relation_Field__c;

        //    List<String> potentialObjects = new List<String>();
        //    if(primaryRelated != null){
        //        potentialObjects.add(primaryRelated);
        //    }

        //    if(secondaryRelated != null){
        //        potentialObjects.add(secondaryRelated);
        //    }

        //    primaryGroupField = settings[0].Primary_Group_Field__c;

        //    if(primaryGroupField != null){
        //        String[] primaryGroupResults = getFieldtypeAndObj(primaryGroupField, potentialObjects);
        //        if(primaryGroupResults != null){
        //            primaryGroupObj = primaryGroupResults[0];
        //            primaryGroupFieldType = primaryGroupResults[1];
        //        }
        //    }

        //    secondaryGroupField = settings[0].Secondary_Group_Field__c;
        //    if(secondaryGroupField != null){
        //        String[] secondaryGroupResults = getFieldtypeAndObj(secondaryGroupField, potentialObjects);
        //        if(secondaryGroupResults != null){
        //            secondaryGroupObj = secondaryGroupResults[0];
        //            secondaryGroupFieldType = secondaryGroupResults[1];
        //        }
        //    }

        //    System.debug('~~~~~' + primaryGroupFieldType);
        //    System.debug('~~~~~' + primaryGroupObj);
        //    System.debug('~~~~~' + secondaryGroupFieldType);
        //    System.debug('~~~~~' + secondaryGroupObj);
        //} else {
        //    ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.FATAL, 
        //        'Custom setting DGRL__c is misconfigured for this object or missing. '+
        //        'Expected to find a DGRL__c custom setting where Object_with_Grid__c = ' 
        //        + objectName + ' but failed.'));
        //}
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