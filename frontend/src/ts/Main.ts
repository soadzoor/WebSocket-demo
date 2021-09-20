import {PromptWindow} from "ui/popups/PromptWindow";
import {ColorUtils, IRGBObject} from "utils/ColorUtils";
import {HTMLUtils} from "utils/HTMLUtils";
import {MathUtils} from "utils/MathUtils";

interface IVec2
{
	x: number | null;
	y: number | null;
}

interface IClientMessage
{
	type: "positionChange" | "click";
	data: IUser | IClickData;
}

interface IServerMessage
{
	type: "positionChange" | "click";
	data: IUser[] | IClickData[];
}

interface IClickData
{
	id: string;
	x: number;
	y: number;
}

interface IUser
{
	id: string;
	name: string;
	color: string;
	x: number | null;
	y: number | null;
}

export class Main
{
	private _name: string = "";
	private _color: string = MathUtils.generateRandomColor();
	private _id: string = MathUtils.generateId();

	private _playground: HTMLElement = document.getElementById("playGround") as HTMLElement;
	private _self: HTMLElement | null = null;
	private _usersData: IUser[] = [];
	private _userElements: HTMLElement[] = [];

	// Normalized coords
	private _previousCursorPos: IVec2 = {
		x: null,
		y: null
	};
	private _cursorPos: IVec2 = {
		x: null,
		y: null
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
			const message: IServerMessage = JSON.parse(event.data);
			
			if (message.type === "positionChange")
			{
				this._usersData = message.data as IUser[];
			}
			else if (message.type === "click")
			{
				const clicksData = message.data as IClickData[];

				for (const clickData of clicksData)
				{
					const user = this._usersData.find(u => u.id === clickData.id);

					if (user)
					{
						HTMLUtils.popCircle(user.color, this._playground, clickData.x * window.innerWidth, clickData.y * window.innerHeight);
					}
				}
			}
		});

		this._name = await PromptWindow.open("What's your name?", "", "", {backdrop: false});

		const selfData: IUser = {
			id: this._id,
			name: this._name,
			color: this._color,
			x: this._cursorPos.x,
			y: this._cursorPos.y,
		}

		if (this._name)
		{
			this._playground.addEventListener("touchstart", this.onTouchStart);
			this._playground.addEventListener("mousedown", this.onMouseDown);
			window.addEventListener("mousemove", this.onMouseMove);
			window.addEventListener("touchmove", this.onTouchMove);

			this._self = this.createUserElement(selfData);
		}

		this._webSocket.send(JSON.stringify(selfData));
		this.tick();
	}

	private onTouchStart = (event: TouchEvent) =>
	{
		event.preventDefault();
		if (event.touches.length === 1)
		{
			this.onPointerDown(event.touches[0].clientX, event.touches[0].clientY);
		}
	};

	private onMouseDown = (event: MouseEvent) =>
	{
		this.onPointerDown(event.clientX, event.clientY);
	};

	private onPointerDown(x: number, y: number)
	{
		this.onPointerMove(x, y);

		HTMLUtils.popCircle(this._color, this._playground, x, y);

		const message: IClientMessage = {
			type: "click",
			data: {
				id: this._id,
				x: x / window.innerWidth,
				y: y / window.innerHeight
			}
		};

		this._webSocket.send(JSON.stringify(message));
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
		this._cursorPos.x = x / window.innerWidth;
		this._cursorPos.y = y / window.innerHeight;
	}

	private createUserElement(userData: IUser)
	{
		const newUserContainer = document.createElement("div");
		newUserContainer.classList.add("userContainer");
		newUserContainer.setAttribute("id", userData.id);

		const newUserName = document.createElement("div");
		newUserName.classList.add("userName");
		newUserName.style.backgroundColor = `#${userData.color}`;

		const colorObject = ColorUtils.hex2rgb(userData.color, 1, "RGBObject") as IRGBObject;
		const inverseColor = `rgb(${255 - colorObject.r}, ${255 - colorObject.g}, ${255 - colorObject.b})`;
		newUserName.style.color = inverseColor;
		newUserName.textContent = userData.name;
		newUserContainer.style.transform = `translate(${(userData.x as number)*window.innerWidth}px, ${(userData.y as number)*window.innerHeight}.px)`;

		const newUserCursor = document.createElement("div");
		newUserCursor.classList.add("userCursor");

		newUserContainer.appendChild(newUserCursor);
		newUserContainer.appendChild(newUserName);

		return newUserContainer;
	}

	private updateUserPosition(userElement: HTMLElement, x: number | null, y: number | null)
	{
		if (x == null || y == null)
		{
			userElement.classList.add("hidden");
		}
		else
		{
			userElement.classList.remove("hidden");
			const newTransform = `translate(${x*window.innerWidth}px, ${y*window.innerHeight}px)`;
			if (newTransform !== userElement.style.transform)
			{
				userElement.style.transform = newTransform;
			}
		}
		
	}

	private updateSelf()
	{
		const self = this._self;

		if (self)
		{
			this.updateUserPosition(self, this._cursorPos.x, this._cursorPos.y);
			if (!self.parentElement)
			{
				this._playground.appendChild(self);
			}
		}
	}

	private updateUsers()
	{
		for (const userElement of this._userElements)
		{
			const userData = this._usersData.find(u => u.id === userElement.getAttribute("id"));

			if (userData)
			{
				this.updateUserPosition(userElement, userData.x, userData.y);
			}
			else
			{
				// data doesn't exist -> user disconnected
				userElement.remove();
			}
		}

		for (const userData of this._usersData)
		{
			const userElement = this._userElements.find(u => u.getAttribute("id") === userData.id);

			if (!userElement)
			{
				// element doesn't exist -> new user connected, we need to add them
				const newUserContainer = this.createUserElement(userData);

				this._userElements.push(newUserContainer);

				if (this._self?.parentElement)
				{
					this._playground.insertBefore(newUserContainer, this._self);
				}
				else
				{
					this._playground.appendChild(newUserContainer);
				}
			}
		}
	}

	private tick = () =>
	{
		this.updateSelf();
		this.updateUsers();
		if (this._cursorPos.x !== this._previousCursorPos.x || this._cursorPos.y !== this._previousCursorPos.y)
		{
			const objectToSend: IClientMessage = {
				type: "positionChange",
				data: {
					id: this._id,
					name: this._name,
					color: this._color,
					x: this._cursorPos.x,
					y: this._cursorPos.y,
				}
			}
			this._webSocket.send(JSON.stringify(objectToSend));

			this._previousCursorPos.x = this._cursorPos.x;
			this._previousCursorPos.y = this._cursorPos.y;
		}

		requestAnimationFrame(this.tick);
	};
}

const main = new Main();