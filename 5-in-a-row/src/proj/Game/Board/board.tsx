import { useEffect, useState } from "react";
import { Square } from "../Square/square";
import "./board.scss";
import { TicTacToeInput } from "../Interfaces/interfaces";
import { useParams } from "react-router-dom";
import Connector from "../../Connection/signalr";

export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array<TicTacToeInput>(9).fill(""));
  const params = useParams<{ lobbyId: string }>();
  const { gameEvents, startGame } = Connector();
  const [enoughPlayer, setEnoughPlayer] = useState(false);

  useEffect(() => {
    const handleBoardInit = (board: Array<TicTacToeInput>) => {
      // console.log(groupss);
      // setGroups(groupss);
      setSquares(board);
      setEnoughPlayer(true);
    };
    const handleEnoughPlayer = () => {
      setEnoughPlayer(false)
    };
    gameEvents(handleBoardInit, handleEnoughPlayer);
  });

  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  const winner = calculateWinner(squares);
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

  return (
    <>
      <h1>{params.lobbyId}</h1>
      <GameStatusBar />
      <div className="status">{status}</div>
      <div className="board">
        <div className="board-row">
          <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
          <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
          <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
        </div>
        <div className="board-row">
          <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
          <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
          <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
        </div>
        <div className="board-row">
          <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
          <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
          <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
        </div>
      </div>
    </>
  );
}

function calculateWinner(squares: TicTacToeInput[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
