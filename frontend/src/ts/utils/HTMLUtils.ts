export class HTMLUtils
{
	public static popCircle(color: string, parentElement: HTMLElement, x: number, y: number, popTime: number = 3000)
	{
		const div = document.createElement("div");
		div.classList.add("poppingCandidate");
		div.style.borderColor = `#${color}`;
		div.style.left = `${x}px`;
		div.style.top = `${y}px`;

		requestAnimationFrame(() =>
		{
			// div.style.left = "calc(50% - " + (div.offsetWidth / 2) + "px)";
			requestAnimationFrame(() =>
			{
				div.classList.add("popping");
			});
		});

		parentElement.appendChild(div);

		setTimeout(() =>
		{
			div.classList.remove("popping");
			parentElement.removeChild(div);
		}, popTime);
	}
}