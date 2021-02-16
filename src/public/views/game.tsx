import React from "react";
import Socket from "socket.io-client";
import getSquares from "../hooks/getSquares";
import "../css/styles.css";

type Players = "X" | "0";

function Game({
  roomID,
  squares: inintalSquares,
  me = "0",
  currentPlayer: inintalPlayer,
  players: inintalPlayers,
}: {
  roomID: string;
  squares: { player: Players | null; position: number }[];
  me: Players;
  currentPlayer: Players;
  players: Players[];
}) {
  const io = Socket.io("/");

  io.on("playerJoined", ({ roomID: checkRoomID }: { roomID: string }) => {
    if (checkRoomID !== roomID) return;
    setPlayers([...players, "X"]);
  });
  const [players, setPlayers] = React.useState(inintalPlayers);
  const [player, setPlayer] = React.useState(inintalPlayer);
  const [myTurn, setTurn] = React.useState(inintalPlayer === me);
  const [squares, setSquares] = getSquares(inintalSquares);

  function changePlayer() {
    setTurn(!myTurn);
    setPlayer(player === "0" ? "X" : "0");
  }

  function chosen(
    square: { player: Players | null; position: number },
    emit: boolean = true
  ) {
    if (square.player && !myTurn) return;
    squares[square.position].player = player;
    if (emit) io.emit("chosenServer", { roomID, player, square });
    changePlayer();
    setSquares(squares);
  }

  io.on(
    "chosenGame",
    ({
      roomID: checkRoomID,
      player,
      square,
    }: {
      roomID: string;
      player: "X" | "0";
      square: { position: number; player: "X" | "0" | null };
    }) => {
      if (roomID !== checkRoomID) return;
      if (player === me) return;
      chosen(square, false);
    }
  );

  return (
    <>
      <div className="top">
        {squares.slice(0, 3).map((square) => (
          <div
            key={square.position}
            onClick={() => {
              chosen(square);
            }}
            style={{
              cursor: myTurn && !square.player ? "pointer" : "not-allowed",
            }}
            className={"square" + square.position}
          >
            {square.player ?? ""}‎
          </div>
        ))}
      </div>
      <div className="middle">
        {squares.slice(3, 6).map((square) => (
          <div
            key={square.position}
            onClick={() => {
              chosen(square);
            }}
            style={{
              cursor: myTurn && !square.player ? "pointer" : "not-allowed",
            }}
            className={"square" + square.position}
          >
            {square.player ?? ""}
          </div>
        ))}
      </div>
      <div className="bottom">
        {squares.slice(6, 9).map((square) => (
          <div
            key={square.position}
            onClick={() => {
              chosen(square);
            }}
            style={{
              cursor: myTurn && !square.player ? "pointer" : "not-allowed",
            }}
            className={"square" + square.position}
          >
            {square.player ?? ""}
          </div>
        ))}
      </div>
    </>
  );
}

export default Game;
