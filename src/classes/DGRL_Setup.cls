public class DGRL_Setup
{
    public DGRL_Setup(ApexPages.StandardController controller)
    {

    }
    @remoteAction
    public static result saveEverything(list<DGRL__c> dgrl,list<Relationship__c> rs)
    {
        try
        {

            list<Database.UpsertResult> ur = Database.upsert(dgrl,Schema.Account,false);
            return new result(ur);
        }
        catch(exception e){
            return new result(e);
        }
    }
    @remoteAction
    public static list<map<String,String>> getSobjectNames()
    {
        list<map<String,String>> objectDescribes = new list<map<String,String>>();

        list<Schema.DescribeSObjectResult> dsors = Schema.describeSObjects(new list<String>(Schema.getGlobalDescribe().keySet()));
        for(Schema.DescribeSObjectResult dsor:dsors)
        {
            map<String,String> sObjectDes = new map<String,String>();
            sObjectDes.put('Name',dsor.getName());
            sObjectDes.put('Label',dsor.getLabel());
            objectDescribes.add(sObjectDes);
        }
        return objectDescribes;
    }
    @remoteAction
    public static list<map<String,Object>> getFieldDescribe(String soName)
    {
        list<map<String,Object>> fieldDescribes = new list<map<String,Object>>();
        list<Schema.DescribeSObjectResult> dsor = Schema.describeSObjects(new list<String>{soName});
        if(dsor.isEmpty())
        {
            return null;
        }
        map<String, Schema.SObjectField> fieldMap = dsor[0].fields.getMap();
        for(Schema.SObjectField dsof:fieldMap.values())
        {
            map<String,Object> fieldDesc = new map<String,Object>();
            Schema.DescribeFieldResult dfr = dsof.getDescribe();
            fieldDesc.put('Name',dfr.getName());
            fieldDesc.put('Label',dfr.getLabel());
            fieldDesc.put('Object',soName);
            fieldDesc.put('Type',String.valueOf(dfr.getType()));
            List<String> ref = new List<String>();
            for(Schema.sObjectType sot :dfr.getReferenceTo())
            {
                ref.add(String.valueOf(sot));
            }
            fieldDesc.put('Reference',ref);
            fieldDescribes.add(fieldDesc);
        }
        return fieldDescribes;

    }
    @remoteAction
    public static map<String,Object> getChildRelationships(list<String> sObjectNames)
    {
        map<String,Object> parent2Child = new map<String,Object>();
        for(Schema.DescribeSObjectResult dsor:Schema.describeSObjects(sObjectNames))
        {
            map<String,Object> child = new map<String,Object>();
            for(Schema.ChildRelationship cr : dsor.getChildRelationships())
            {
                Schema.DescribeSObjectResult cdsor = cr.getChildSObject().getDescribe();
                child.put('Name',cdsor.getName());
                child.put('Label',cdsor.getLabel());
                child.put('Field', cr.getField());
            }
            parent2Child.put(dsor.getName(),child);
        }
        return parent2Child;
    }


}
