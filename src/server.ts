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

app.use(express.json());
app.use(express.static("./src/public"));
registor(app).catch(console.error);

interface Game {
  squares: { position: number; player: "X" | "0" | null }[];
  players: ["X" | "0" | null, "X" | "0" | null];
}

const games: { [key: string]: Game } = {};

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/:roomID", (req, res) => {});

app.post("/create", (req, res) => {
  const roomID = uuidv4();
  games[roomID] = {
    squares: inintialSquares,
    players: ["0", null],
  };
  res.json({ roomID });
});

io.on("connect", (socket: Socket) => {
  socket.on("message", (message: { content: string }) => {
    console.log("Came from Socket", message);
  });
});

http.listen(PORT, () => console.log(`http://localhost:${PORT}`));
