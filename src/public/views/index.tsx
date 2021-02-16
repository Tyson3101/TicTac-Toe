import React from "react";
import fetch from "node-fetch";
import { useHistory } from "react-router";

function Index({ url }: { url: string }) {
  const history = useHistory();
  const gameRoom = React.useRef() as { current: HTMLInputElement };
  const [error, setError] = React.useState("");
  async function joinGame() {
    const data: { error?: string; roomID: string } = await fetch(
      url + `/${gameRoom.current.value}`,
      { method: "POST" }
    ).then((res) => res.json());
    if (data?.error) {
      setError(data.error);
    }
    if (data.roomID) {
      history.push(url + `/${data.roomID}`);
    }
  }
  async function createGame() {
    const data: { error?: string; roomID: string } = await fetch(
      url + "/create",
      { method: "POST" }
    ).then((res) => res.json());
    if (data?.error) {
      setError(data.error);
    }
    if (data.roomID) {
      history.push(url + `/${data.roomID}`);
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
          <span style={{ display: "block" }}>{error}</span>
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
