export class MathUtils
{
	// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	public static generateId(length: number = 5): string
	{
		let result = "";
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++)
		{
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}

	public static generateRandomColor(): string
	{
		return (Math.random().toString(16) + "000000").substring(2, 8);
	}
}