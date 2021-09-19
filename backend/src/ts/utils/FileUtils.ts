import * as fs from "fs";

export class FileUtils
{
	public static readBinaryFile(filePath: string)
	{
		return new Promise<Buffer>((resolve, reject) =>
		{
			fs.readFile(filePath, async (err: NodeJS.ErrnoException | null, data: Buffer) =>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					resolve(data);
				}
			});
		});
	}

	public static async readTextFile(filePath: string)
	{
		return (await this.readBinaryFile(filePath)).toString();
	}

	/**
	 * Asynchronously append data to a file, creating the file if it does not exist.
	 */
	public static appendToFile(filePath: string, text: string)
	{
		return new Promise<void>((resolve, reject) =>
		{
			fs.appendFile(filePath, text, (err: NodeJS.ErrnoException) =>
			{
				if (err)
				{
					console.error(err);
				}
				else
				{
					resolve();
				}
			});
		});
	}

	public static readDir(folderPath: string)
	{
		return new Promise<string[]>((resolve, reject) =>
		{
			fs.readdir(folderPath, (err: NodeJS.ErrnoException, files: string[]) =>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					resolve(files);
				}
			});
		});
	}

	public static async saveFile(buffer: Buffer, filePath: string)
	{
		return new Promise<void>((resolve, reject) =>
		{
			fs.writeFile(filePath, buffer, "binary", (err: NodeJS.ErrnoException) =>
			{
				if (err)
				{
					reject();
				}
				else
				{
					resolve();
				}
			});
		});
		
	}

	public static removeFileOrDir(filePath: string)
	{
		return new Promise<void>((resolve, reject) =>
		{
			// You have to have node v14 or newer for this!
			fs.rm(filePath, {recursive: true}, (err: NodeJS.ErrnoException) =>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					resolve();
				}
			});
		});
	}

	public static makeDir(path: string)
	{
		return new Promise<void>((resolve, reject) =>
		{
			fs.mkdir(path, (err: NodeJS.ErrnoException) =>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					resolve();
				}
			});
		});
	}
}