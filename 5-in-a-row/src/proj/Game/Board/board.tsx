import { useEffect, useState } from "react";
import { Square } from "../Square/square";
import "./board.scss";
import { TicTacToeInput } from "../Interfaces/interfaces";
import { useParams } from "react-router-dom";
import Connector from "../../Connection/signalr";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import click_sound_asset from "../../../assets/coin.wav";
import { Button } from "react-bootstrap";

export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array<Array<TicTacToeInput>>);
  const params = useParams<{ lobbyId: string }>();
  const { gameEvents, placePiece, restartGame} = Connector();
  const [enoughPlayer, setEnoughPlayer] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const click_sound = new Audio(click_sound_asset);
    console.log("effect wtf");
    const handleBoardInit = (board: Array<Array<TicTacToeInput>>) => {
      setSquares(board);
      setEnoughPlayer(true);
      setWinner(null);
    };
    const handleEnoughPlayer = () => {
      setEnoughPlayer(false);
    };
    const handlePiecePlaced = (
      x: number,
      y: number,
      input: TicTacToeInput,
      player1Turn: boolean
    ) => {
      squares[y][x] = input;
      setXIsNext(player1Turn);
      click_sound.play();
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
  }, [gameEvents, squares]);

  function handleClick(x: number, y: number) {
    if (squares[y][x] || winner) {
      return;
    }
    placePiece(x, y, params.lobbyId ?? "");
  }

  function Status() {
    if (winner) {
      return (
        <>
          <div className="status">{"Winner: " + winner}</div>
          <Button onClick={() => restartGame(params.lobbyId ?? "")}>
            Revanche ?
          </Button>
        </>
      );
    } else {
      return (
        <div className="status">{"Next player: " + (xIsNext ? "X" : "O")}</div>
      );
    }
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
      <Status />
      <div className="board-wrapper" onContextMenu={(e) => e.preventDefault()}>
        <TransformWrapper
          initialScale={1}
          limitToBounds={false}
          minScale={0.05}
          panning={{ allowLeftClickPan: false }}
          centerOnInit={true}
          // minPositionX={-5000}
          // minPositionY={-5000}
          // maxPositionX={5000}
          // maxPositionY={5000}
          // centerZoomedOut={true}
          // disablePadding={true}
          // smooth={false}
        >
          <TransformComponent>
            <div className="board">
              <BoardField />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </>
  );
}
