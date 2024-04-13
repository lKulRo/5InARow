import { TicTacToeInput } from "../Interfaces/interfaces.tsx";
import './square.scss'

export function Square({value, onSquareClick}: {value: TicTacToeInput, onSquareClick: React.MouseEventHandler<HTMLButtonElement>}) {
  return <button className="square" onClick={onSquareClick}>{value}</button>;
}
