public class demoNgForce1Page {
	@RemoteAction
	public static map<String,set<String>> getSobjectFields()
	{
		List<String> sObjectTypes = new list<String>(Schema.getGlobalDescribe().keySet());
		map<String,set<String>> oName2fieldList = new map<String,set<String>>();
		List<Schema.DescribeSObjectResult> DSRs  = schema.describeSObjects(sObjectTypes);
		for(Schema.DescribeSObjectResult DSR:DSRs)
		{
			oName2fieldList.put(DSR.getName(),DSR.fields.getMap().keySet());
		}
		return oName2fieldList; 
	}
}