public with sharing class SL_DGRL_Extension {

    public transient String objectId                 {get;set;}
    public transient String objectName               {get;set;}

    public transient String primaryRelated           {get;set;}
    public transient String primaryRelatedField      {get;set;}
    public transient String secondaryRelated         {get;set;}
    public transient String secondaryRelatedField    {get;set;}

    public transient String primaryGroupField        {get;set;}
    public transient String primaryGroupFieldType    {get;set;}
    public transient String primaryGroupObj          {get;set;}

    public transient String secondaryGroupField      {get;set;}
    public transient String secondaryGroupFieldType  {get;set;}
    public transient String secondaryGroupObj        {get;set;}

    public SL_DGRL_Extension(ngForceController controller) {
        Id currentId = ApexPages.currentPage().getParameters().get('id');
        objectName = currentId.getSobjectType().getDescribe().getName();

        objectId = '\''+currentId+'\''; // Dynamic SOQL expects quotes

        List<DGRL__c> settings = [SELECT Primary_Related_Object__c, 
                                     Primary_Related_Object_Relation_Field__c,
                                     Secondary_Related_Object__c,
                                     Secondary_Related_Object_Relation_Field__c,
                                     Primary_Group_Field__c,
                                     Secondary_Group_Field__c
                                  FROM DGRL__c
                                  WHERE Object_with_Grid__c = :objectName
                                  LIMIT 1];

        if(settings.size() > 0){
            primaryRelated = settings[0].Primary_Related_Object__c;
            primaryRelatedField = settings[0].Primary_Related_Object_Relation_Field__c;
            secondaryRelated = settings[0].Secondary_Related_Object__c;
            secondaryRelatedField = settings[0].Secondary_Related_Object_Relation_Field__c;

            List<String> potentialObjects = new List<String>();
            if(primaryRelated != null){
                potentialObjects.add(primaryRelated);
            }

            if(secondaryRelated != null){
                potentialObjects.add(secondaryRelated);
            }

            primaryGroupField = settings[0].Primary_Group_Field__c;

            if(primaryGroupField != null){
                String[] primaryGroupResults = getFieldtypeAndObj(primaryGroupField, potentialObjects);
                if(primaryGroupResults != null){
                    primaryGroupObj = primaryGroupResults[0];
                    primaryGroupFieldType = primaryGroupResults[1];
                }
            }

            secondaryGroupField = settings[0].Secondary_Group_Field__c;
            if(secondaryGroupField != null){
                String[] secondaryGroupResults = getFieldtypeAndObj(secondaryGroupField, potentialObjects);
                if(secondaryGroupResults != null){
                    secondaryGroupObj = secondaryGroupResults[0];
                    secondaryGroupFieldType = secondaryGroupResults[1];
                }
            }

            System.debug('~~~~~' + primaryGroupFieldType);
            System.debug('~~~~~' + primaryGroupObj);
            System.debug('~~~~~' + secondaryGroupFieldType);
            System.debug('~~~~~' + secondaryGroupObj);
        } else {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.FATAL, 
                'Custom setting DGRL__c is misconfigured for this object or missing. '+
                'Expected to find a DGRL__c custom setting where Object_with_Grid__c = ' 
                + objectName + ' but failed.'));
        }
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