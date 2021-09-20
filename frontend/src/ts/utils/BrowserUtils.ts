export class BrowserUtils
{
	public static get siteUrl()
	{
		return `${window.location.protocol}//${window.location.host}${window.location.pathname}`
	}
}