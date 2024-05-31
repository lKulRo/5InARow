import * as signalR from "@microsoft/signalr";
import { TicTacToeInput } from "../Game/Interfaces/interfaces";
let URL = "";
if (process.env.NODE_ENV == 'production') {
  URL = "http://49.13.164.181:41460/hub";
}else{
  URL = "http://localhost:41460/hub"
}
class Connector {
  private connection: signalR.HubConnection;
  public events: (
    onGetGroups: (group: Array<Group>) => void,
    onClientJoined: (username: string) => void
  ) => void;
  public gameEvents: (
    onBoardInit: (board: Array<Array<TicTacToeInput>>) => void,
    onEnoughPlayer: () => void,
    onPiecePlaced: (x: number, y:number, input: TicTacToeInput, player1Turn: boolean) => void,
    onWinner: (winnerName:string) => void
  ) => void;
  static instance: Connector;
  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(URL)
      .withAutomaticReconnect()
      .build();
    this.connection.start().catch((err) => document.write(err));
    this.events = (onGetGroups, onClientJoined) => {
      this.connection.on("GetGroups", (groups: Array<Group>) => {
        onGetGroups(groups);
      });
      this.connection.on("clientJoined", (username: string) => {
        onClientJoined(username);
      });
    };
    this.gameEvents = (onBoardInit, onEnoughPlayer, onPiecePlaced, onWinner) => {
      this.connection.on("BoardInit", (board: Array<Array<TicTacToeInput>>) => {
        onBoardInit(board);
      });
      this.connection.on("NotEnoughPlayer", () => {
        onEnoughPlayer();
      });
      this.connection.on(
        "PiecePlaced",
        (x: number, y:number, input: TicTacToeInput, player1Turn: boolean) => {
          onPiecePlaced(x,y,input, player1Turn);
          console.log("signlar: piece placed");
        }
      );
      this.connection.on(
        "Winner",
        (winnerName:string) =>{
          onWinner(winnerName);
        }
      );
    };
  }
  public newMessage = (username: string, messages: string) => {
    this.connection
      .invoke("NewMessage", username, messages)
      .then(() => console.log("sent" + messages));
  };
  public registerClient = (username: string) => {
    this.connection
      .invoke("RegisterClient", username)
      .then(() => console.log("Client registered"));
  };
  public startGame = (groupName: string) => {
    this.connection
      .invoke("StartGame", groupName)
      .then(() => console.log("Trying to start Game"));
  };
  public restartGame = (groupName: string) => {
    this.connection
      .invoke("RestartGame", groupName)
      .then(() => console.log("Trying to restart Game"));
  };
  public placePiece = (field_x: number, field_y:number,groupName: string) => {
    this.connection
      .invoke("PlacePiece", field_x, field_y, groupName)
      .then(() => console.log("Place Piece"));
  };
  public getGroups = () => {
    this.connection
      .invoke("GetGroups")
      .then(() => console.log("Getting Groups"));
  };
  public registerGroup = (groupName: string) => {
    this.connection
      .invoke("RegisterGroup", groupName)
      .then(() => console.log("Register Group"));
  };
  public static getInstance(): Connector {
    if (!Connector.instance) Connector.instance = new Connector();
    return Connector.instance;
  }
}
export default Connector.getInstance;

export interface Group {
  groupName: string;
  clients: Array<Client>;
}
interface Client {
  connectionId: string;
  userName: string;
}
