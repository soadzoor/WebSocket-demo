import {PromptWindow} from "ui/popups/PromptWindow";
import {MathUtils} from "utils/MathUtils";

interface IVec2
{
	x: number;
	y: number;
}

export class Main
{
	private _name: string = "";
	private _color: string = MathUtils.generateRandomColor();
	private _id: string = MathUtils.generateId();

	private _playground: HTMLElement = document.getElementById("playGround") as HTMLElement;
	private _previousCursorPos: IVec2 = {
		x: 0,
		y: 0
	};
	private _cursorPos: IVec2 = {
		x: 0,
		y: 0
	};

	private _webSocket = new WebSocket("ws://localhost:8081");

	constructor()
	{
		this.init();
	}

	private async init()
	{
		this._webSocket.addEventListener("open", (event: Event) =>
		{
			console.log("Connection with WebSocket established");
		});

		this._webSocket.addEventListener("message", (event: MessageEvent) =>
		{
			const message = `Received message on client side: ${event.data}`;
			console.log(message);
		});

		this._name = await PromptWindow.open("What's your name?", "", "", {backdrop: false});

		if (this._name)
		{
			window.addEventListener("mousemove", this.onMouseMove);
			window.addEventListener("touchmove", this.onTouchMove);
			this.tick();
		}
	}

	private onMouseMove = (event: MouseEvent) =>
	{
		this.onPointerMove(event.clientX, event.clientY);
	};

	private onTouchMove = (event: TouchEvent) =>
	{
		if (event.touches.length === 1)
		{
			this.onPointerMove(event.touches[0].clientX, event.touches[0].clientY);
		}
	};

	private onPointerMove(x: number, y: number)
	{
		this._cursorPos.x = x;
		this._cursorPos.y = y;
	}

	private tick = () =>
	{
		if (this._cursorPos.x !== this._previousCursorPos.x || this._cursorPos.y !== this._previousCursorPos.y)
		{
			const objectToSend = {
				id: this._id,
				name: this._name,
				color: this._color,
				x: this._cursorPos.x,
				y: this._cursorPos.y,
			}
			this._webSocket.send(JSON.stringify(objectToSend));

			this._previousCursorPos.x = this._cursorPos.x;
			this._previousCursorPos.y = this._cursorPos.y;
		}

		requestAnimationFrame(this.tick);
	};
}

const main = new Main();