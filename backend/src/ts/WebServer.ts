import express from "express";
import expressWs from "express-ws";
import {IncomingMessage} from "http";

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

interface IUserWithSocket extends IUser
{
	socket?: WebSocket;
}

export class WebServer
{
	private _app = express();
	private _expressWs = expressWs(this._app);

	private _clicks: IClickData[] = [];
	private _users: IUserWithSocket[] = [];
	private _previousStringifiedUsersObject: string = "";
	private _tickFrequency = 60; // Hz
	private _timeOutDelay = 1000 / this._tickFrequency;

	constructor()
	{
		this.init();
	}

	private init()
	{
		this._expressWs.app.ws("/", (ws, req) =>
		{
			//ws.send("hello!");
		});

		const wss = this._expressWs.getWss();

		wss.on("connection", (socket: WebSocket, request: IncomingMessage) =>
		{
			console.log("New client connected");

			let userData: IUser = {
				id: "placeholder",
				color: "placeholder",
				x: null,
				y: null,
				name: "placeholder"
			};

			socket.onmessage = (event: MessageEvent<string>) =>
			{
				const message: IClientMessage = JSON.parse(event.data);
				if (message.type === "positionChange")
				{
					userData = message.data as IUser;
					const existingUserData = this._users.find(u => u.id === userData.id);
					if (existingUserData)
					{
						existingUserData.x = userData.x;
						existingUserData.y = userData.y;
					}
					else
					{
						this._users.push({
							...userData,
							socket: socket
						});
					}
				}
				else if (message.type === "click")
				{
					this._clicks.push(message.data as IClickData);
				}
			};

			socket.onclose = (event: CloseEvent) =>
			{
				console.log(`User disconnected: ${userData.id}, ${userData.name}`);
				this._users = this._users.filter(u => u.socket !== socket);
			};
		});

		this._expressWs.app.listen(8081, () =>
		{
			console.log("Listening...");
			this.tick();
		});
	}

	private tick = () =>
	{
		const stringifiedUsersObject = JSON.stringify(this._users);
		if (this._previousStringifiedUsersObject !== stringifiedUsersObject)
		{
			this._previousStringifiedUsersObject = stringifiedUsersObject;

			for (const user of this._users)
			{
				const userDataToSend = this._users
					.filter(u => u.id !== user.id && u.x != null && u.y != null) // we don't send it back to the original sender
					.map(u =>
					{
						const ret = {...u};
						delete ret.socket;

						return ret;
					});

				const message: IServerMessage = {
					type: "positionChange",
					data: userDataToSend
				};

				user.socket?.send(JSON.stringify(message));
			}
		}

		if (this._clicks.length > 0)
		{
			for (const user of this._users)
			{
				const clickDataToSend: IClickData[] = this._clicks
					.filter(clickData => clickData.id !== user.id) // we don't send it back to the original sender

				const message: IServerMessage = {
					type: "click",
					data: clickDataToSend
				};

				user.socket?.send(JSON.stringify(message));
			}

			this._clicks.length = 0;
		}

		setTimeout(this.tick, this._timeOutDelay);
	};
}

const webServer = new WebServer();