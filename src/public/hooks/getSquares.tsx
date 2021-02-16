import { useState } from "react";
import inintalSquaresJSON from "./intitialSquares";

export default function GetSquares(
  inintalSquares: { player: "X" | "0" | null; position: number }[]
) {
  return useState(inintalSquares ?? inintalSquaresJSON);
}
