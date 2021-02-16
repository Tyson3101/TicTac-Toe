import React from "react";
import ReactRouter from "react-router";
import Socket from "socket.io-client";
import fetch from "node-fetch";
import getSquares from "../hooks/getSquares";
import "../css/styles.css";

type Players = "X" | "0";

function Game({
  roomID,
  inintalSquares,
  me = "0",
  inintalPlayer,
}: {
  roomID: string;
  inintalSquares: { player: Players | null; position: number }[];
  me: Players;
  inintalPlayer: Players;
}) {
  const io = Socket.io("/");

  const [player, setPlayer] = React.useState(inintalPlayer as Players);
  const [squares, setSquares] = getSquares(inintalSquares);

  function changePlayer() {
    if (player === "X") setPlayer("0");
    else setPlayer("X");
    return player;
  }

  return (
    <>
      <div className="top">
        {squares.slice(0, 3).map((square) => (
          <div
            key={square.position}
            onClick={() => {
              squares[square.position].player = player;
              changePlayer();
              setSquares(squares);
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
              squares[square.position].player = player;
              changePlayer();
              setSquares(squares);
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
              squares[square.position].player = player;
              changePlayer();
              setSquares(squares);
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
