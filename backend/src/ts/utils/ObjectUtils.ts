export class ObjectUtils
{
	public static deepClone<T>(obj: any): T
	{
		return JSON.parse(JSON.stringify(obj));
	}
}