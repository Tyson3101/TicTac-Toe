/// <reference path="../Express.d.ts" />
import ENV from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import HTTP from "http";
import { Server, Socket } from "socket.io";
import registor from "@react-ssr/express/register";
import { v4 as uuidv4 } from "uuid";
import inintialSquares from "./public/hooks/intitialSquares";

ENV.config();
const app = express();
const http = HTTP.createServer(app);
const io = new Server(http);
const PORT = process.env.PORT ?? 5000;

app.use((req, _res, next) => {
  req.fullURL = req.protocol + "://" + req.get("host") + req.originalUrl;
  req.baseURL = req.protocol + "://" + req.get("host");
  next();
});
app.use(express.json());
app.use(express.static("./src/public"));
registor(app).catch(console.error);

interface Game {
  squares: { position: number; player: "X" | "0" | null }[];
  players: ("X" | "0")[];
  currentPlayer: "X" | "0";
}

const games: { [key: string]: Game } = {};

app.get("/", (req, res) => {
  res.render("index", { baseURL: req.baseURL });
});

app.get("/:roomID", (req, res) => {
  const { roomID } = req.params;
  const game = games[roomID];
  if (!game) {
    return res.render("index", {
      RAWerror: "No game found!",
      baseURL: req.baseURL,
    });
  }
  if (game.players.length === 2) {
    return res.render("index", {
      RAWerror: "Game full!",
      baseURL: req.baseURL,
    });
  }

  let me: "X" | "0";
  if (!game.players.length) {
    game.players.push("0");
    game.currentPlayer = "0";
    me = "0";
  } else {
    me = "X";
    game.players.push("X");
  }
  res.render("game", { ...game, baseURL: req.baseURL, roomID, me });
  io.sockets.emit("playerJoined", { roomID });
});

app.post("/create", (req, res) => {
  const roomID = uuidv4();
  games[roomID] = {
    squares: inintialSquares,
    players: [],
    currentPlayer: null!,
  };

  res.json({ roomID });
});

app.post("/:roomID", (req, res) => {
  const { roomID } = req.params;
  const game = games[roomID];
  if (!game) {
    return res.json({ error: "No game found!" });
  }
  if (game.players.length === 2) {
    return res.json({ error: "Game full!" });
  }

  res.json({ roomID });
});

io.on("connect", (socket: Socket) => {
  socket.on(
    "chosenServer",
    ({
      roomID,
      player,
      square,
    }: {
      roomID: string;
      player: "X" | "0";
      square: { position: number; player: "X" | "0" | null };
    }) => {
      const game = games[roomID];
      game.squares[square.position].player = player;
      game.currentPlayer = player === "0" ? "X" : "0";
      io.sockets.emit("chosenGame", {
        roomID,
        player,
        square,
      });
    }
  );
});

http.listen(PORT, () => console.log(`http://localhost:${PORT}`));
