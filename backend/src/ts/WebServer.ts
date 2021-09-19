import express from "express";
import expressWs from "express-ws";
import {IncomingMessage} from "http";

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

	private _users: IUserWithSocket[] = [];
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

			socket.onmessage = (event: MessageEvent) =>
			{
				userData = JSON.parse(event.data);
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
		for (const user of this._users)
		{
			const usersExceptTheReceiver = this._users
				.filter(u => u.id !== user.id && u.x != null && u.y != null)
				.map(u =>
				{
					const ret = {...u};
					delete ret.socket;

					return ret;
				});


			user.socket?.send(JSON.stringify(usersExceptTheReceiver));
		}

		setTimeout(this.tick, this._timeOutDelay);
	};
}

const webServer = new WebServer();