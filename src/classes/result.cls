global class result
{
	Boolean success;
	Id sfId;
	CustomError[] errors = new customError[]{};
	CustomException e;

	global result(Database.UpsertResult ur)
	{
		this.success = ur.isSuccess();
		this.sfId = ur.getId();
		for(Database.Error e:ur.getErrors())
		{
			this.errors.add(new customError(e));
		}

	}
	//use polymorphism for Account Update case
	global result(Database.saveResult sr)
	{
		this.success = sr.isSuccess();
		this.sfId = sr.getId();
		for(Database.Error e:sr.getErrors())
		{
			this.errors.add(new customError(e));
		}

	}
	global result(Exception e)
	{
		this.e = new customException(e);
	}

    //wraps Database.error for serialization in ur class above
    global class customError
    {
    	String[] fields= new String[]{};
    	String message;

        customError(Database.Error e)
    	{
    		this.fields = e.getFields();
    		this.message = e.getMessage();
    	}
    }
    //wraps Database.error for serialization in ur class above
    global class customException extends Exception
    {
    	Integer lineNumber;
    	String message;
    	String stackTraceString;

        customException(customException e)
    	{
    		this.lineNumber = e.getLineNumber();
    		this.message = e.getMessage();
    		this.stackTraceString=e.getStackTraceString();
    	}
    }
}