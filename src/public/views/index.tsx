import React from "react";
import fetch from "node-fetch";
import { useHistory } from "react-router";

function Index({
  baseURL,
  RAWerror = "",
}: {
  baseURL: string;
  RAWerror: string;
}) {
  const gameRoom = React.useRef() as { current: HTMLInputElement };
  const [error, setError] = React.useState(RAWerror);
  const history = useHistory();
  function redirect(urltoGo: string) {
    return (window.location.href = urltoGo);
  }
  async function joinGame() {
    if (!gameRoom.current.value) return;
    const data: { error?: string; roomID: string } = await fetch(
      baseURL + `/${gameRoom.current.value}`,
      { method: "POST" }
    ).then((res) => res.json());
    if (data?.error) {
      setError(data.error);
    }
    if (data.roomID) {
      redirect(baseURL + `/${data.roomID}`);
    }
  }
  async function createGame() {
    console.log("Making Request!");
    const data: { error?: string; roomID: string } = await fetch(
      baseURL + "/create",
      { method: "POST" }
    ).then((res) => res.json());

    if (data?.error) {
      setError(data.error);
    }
    if (data.roomID) {
      redirect(baseURL + `/${data.roomID}`);
    }
  }
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <form>
        <p>
          Join Game
          <input ref={gameRoom} style={{ marginLeft: "15px" }} type="text" />
          <input
            type="button"
            style={{ marginLeft: "15px" }}
            onClick={joinGame}
            value={"Join Game"}
          />
          <span
            style={{ display: "block", fontSize: "2rem", fontWeight: "bolder" }}
          >
            {error}
          </span>
        </p>
        <p>
          <input
            type="button"
            style={{ display: "block" }}
            onClick={createGame}
            value={"Create Game"}
          />
        </p>
      </form>
    </>
  );
}

export default Index;
