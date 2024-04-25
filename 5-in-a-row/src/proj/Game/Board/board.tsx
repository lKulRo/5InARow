import { useEffect, useState } from "react";
import { Square } from "../Square/square";
import "./board.scss";
import { TicTacToeInput } from "../Interfaces/interfaces";
import { useParams } from "react-router-dom";
import Connector from "../../Connection/signalr";

export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array<Array<TicTacToeInput>>);
  const params = useParams<{ lobbyId: string }>();
  const { gameEvents, placePiece } = Connector();
  const [enoughPlayer, setEnoughPlayer] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const handleBoardInit = (board: Array<Array<TicTacToeInput>>) => {
      setSquares(board);
      setEnoughPlayer(true);
    };
    const handleEnoughPlayer = () => {
      setEnoughPlayer(false);
    };
    const handlePiecePlaced = (
      board: Array<Array<TicTacToeInput>>,
      player1Turn: boolean
    ) => {
      setSquares(board);
      setXIsNext(player1Turn);
    };
    const handleWinner = (winnerName: string) => {
      setWinner(winnerName);
    };
    gameEvents(
      handleBoardInit,
      handleEnoughPlayer,
      handlePiecePlaced,
      handleWinner
    );
  });

  function handleClick(x: number, y: number) {
    if (squares[y][x] || winner) {
      return;
    }
    placePiece(x, y, params.lobbyId ?? "");
  }

  let status;

  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function GameStatusBar() {
    if (enoughPlayer) {
      return <h2>Game starting</h2>;
    } else {
      return <h2>Waiting for second player</h2>;
    }
  }
  function BoardField() {
    return squares.map((row, y_index) => {
      return (
        <div className="board-row">
          {row.map((sqaure, x_index) => {
            return (
              <Square
                value={sqaure}
                onSquareClick={() => handleClick(x_index, y_index)}
              />
            );
          })}
        </div>
      );
    });
  }

  return (
    <>
      <h1>{params.lobbyId}</h1>
      <GameStatusBar />
      <div className="status">{status}</div>
      <div className="board">
        <BoardField />
      </div>
    </>
  );
}
