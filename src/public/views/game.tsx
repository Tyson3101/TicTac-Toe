import React from "react";
import Socket from "socket.io-client";
import getSquares from "../hooks/intitialSquares";
import index from "./index";
import "../css/styles.css";

type Players = "X" | "0";

function Game({
  roomID,
  squares: inintalSquares,
  me = "0",
  currentPlayer: inintalPlayer,
  players: inintalPlayers,
  baseURL,
}: {
  roomID: string;
  squares: { player: Players | null; position: number }[];
  me: Players;
  currentPlayer: Players;
  players: Players[];
  baseURL: string;
}) {
  const io = Socket.io("/");

  const [players, setPlayers] = React.useState(inintalPlayers);
  const [player, setPlayer] = React.useState(inintalPlayer);
  const [myTurn, setTurn] = React.useState(inintalPlayer === me);
  const [squares, setSquares] = React.useState(inintalSquares);
  const [anyNotfication, setAnyNotfication] = React.useState(
    null as null | string
  );
  const [turnNotfication, setTurnNotfication] = React.useState("");
  const [winner, setWinner] = React.useState(
    null! as { winner: Players | false; winningSquares: number[] }
  );

  React.useEffect(() => {
    if (players.length !== 2) setAnyNotfication("Waiting for other player...");
  }, []);
  React.useEffect(() => {
    if (players.length !== 2) setAnyNotfication("Waiting for other player...");
    else setAnyNotfication(null);
  }, [players]);
  if (!roomID)
    return <div>{index({ baseURL: baseURL, RAWerror: "Unknown Error!" })}</div>;

  React.useEffect(() => {
    setTurnNotfication(
      (() => {
        if (player === "0") return "Circles turn!";
        else return "Crosses turn!";
      })()
    );
  }, [player]);

  io.on("playerJoined", ({ roomID: checkRoomID }: { roomID: string }) => {
    if (checkRoomID !== roomID) return;
    if (players.includes("X")) return;
    else setPlayers([...players, "X"]);
  });

  function changePlayer(changePlayer: Players = player) {
    setTurn(changePlayer === me ? false : true);
    setPlayer(changePlayer === "0" ? "X" : "0");
  }

  function chosen(square: { player: Players | null; position: number }) {
    if (!myTurn || square.player || anyNotfication) return;
    squares[square.position].player = player;
    io.emit("chosenServer", { roomID, player, square });
    changePlayer();
    setSquares(squares);
  }

  function chosenEmit(
    square: { player: Players | null; position: number },
    playerChosen: Players
  ) {
    squares[square.position].player = playerChosen;
    changePlayer(playerChosen);
    setSquares(squares);
  }

  io.on(
    "chosenGame",
    ({
      roomID: checkRoomID,
      player,
      square,
      gotWinner,
    }: {
      roomID: string;
      player: "X" | "0";
      square: { position: number; player: "X" | "0" | null };
      gotWinner: { winner: "X" | "0" | false; winningSquares: number[] };
    }) => {
      if (roomID !== checkRoomID) return;
      if (player === me) {
        if (gotWinner.winner) {
          setWinner(gotWinner);
        }
      } else {
        if (!square) return changePlayer();
        chosenEmit(square, player);
        if (gotWinner.winner) {
          setWinner(gotWinner);
        }
      }
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
              cursor:
                myTurn && !square.player && !anyNotfication
                  ? "pointer"
                  : "not-allowed",
              backgroundColor: winner?.winningSquares?.includes(square.position)
                ? "lightcoral"
                : "#92d192",
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
              cursor:
                myTurn && !square.player && !anyNotfication
                  ? "pointer"
                  : "not-allowed",
              backgroundColor: winner?.winningSquares?.includes(square.position)
                ? "lightcoral"
                : "#92d192",
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
              cursor:
                myTurn && !square.player && !anyNotfication
                  ? "pointer"
                  : "not-allowed",
              backgroundColor: winner?.winningSquares?.includes(square.position)
                ? "lightcoral"
                : "#92d192",
            }}
            className={"square" + square.position}
          >
            {square.player ?? ""}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!anyNotfication || !winner.winner ? (
          <h1>
            <ul>
              <li>{turnNotfication}</li>
            </ul>
          </h1>
        ) : (
          <h1>{anyNotfication ?? winner.winner}</h1>
        )}
      </div>
    </>
  );
}

export default Game;
