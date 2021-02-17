/// <reference path="../Express.d.ts" />
import ENV from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import HTTP from "http";
import { Server, Socket } from "socket.io";
import registor from "@react-ssr/express/register";
import { v4 as uuidv4 } from "uuid";
import intitialSquares from "./public/hooks/intitialSquares";

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

const games: { [key: string]: Game } = {
  test: {
    squares: intitialSquares,
    players: [],
    currentPlayer: null!,
  },
};

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
  io.sockets.emit("playerJoined", { roomID, ...game });
});

app.post("/create", (req, res) => {
  const roomID = uuidv4();
  games[roomID] = {
    squares: intitialSquares,
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

const checkIfWinner = (player: "X" | "0", game: Game) => {
  const possibleCombinations: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const winner = possibleCombinations.find((combination) => {
    if (
      combination.filter((position) => game.squares[position].player === player)
        .length === combination.length
    )
      return combination;
  });
  return { winningSquares: winner ?? [], winner: winner ? player : false };
};

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
      if (!square)
        return (() => {
          if (player === "0") game.currentPlayer = "X";
          else game.currentPlayer = "0";
          io.sockets.emit("chosenGame", {
            roomID,
            player,
            square,
            gotWinner: {
              winner: false,
              winningSquares: [],
            },
          });
        })();
      game.squares[square.position].player = player;
      if (player === "0") game.currentPlayer = "X";
      else game.currentPlayer = "0";

      const gotWinner = checkIfWinner(player, game).winner;
      console.log(gotWinner);
      io.sockets.emit("chosenGame", {
        roomID,
        player,
        square,
        gotWinner,
      });
    }
  );
});

http.listen(PORT, () => console.log(`http://localhost:${PORT}`));
