export class MathUtils
{
	public static isValidNumber = (value: number) =>
	{
		if (value === null) return false;
		if (value === undefined) return false;
		if (isNaN(value)) return false;
		if (value === Infinity) return false;
		if (value === -Infinity) return false;

		return true;
	};

	public static floorPowerOfTwo(value: number)
	{
		return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
	}

	public static isPowerOfTwo(value: number)
	{
		return (value & (value - 1)) === 0 && value !== 0;
	}
}