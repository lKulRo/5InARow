import { useEffect, useState } from "react";
import Connector, { Group } from "../Connection/signalr";
import { Link } from "react-router-dom";

export default function Login() {
  const { events, registerGroup, startGame } = Connector();
  const [userName, setUserName] = useState("");
  const [groups, setGroups] = useState(Array<Group>);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const handleGroups = (groupss: Array<Group>) => {
      console.log(groupss);
      setGroups(groupss);
    };
    const handleClientJoin = (username: string) => {
      setUserName(username);
    };
    events(handleGroups, handleClientJoin);
  });
  const list = groups.map((x) => (
    <li>
      <Link
        key={x.groupName}
        to={`/lobby/${x.groupName}`}
        onClick={() => {
          registerGroup(x.groupName);
          startGame(x.groupName);
        }}
      >
        <button>{x.groupName}</button>
      </Link>
    </li>
  ));

  function ListHeaderText(){
    if(groups.length > 0){
        return <h2>Lobbies:</h2>
    }else{
        return <h2>No open lobbies currently, try create one</h2>
    }
  }

  return (
    <>
      <h1>Hello {userName}</h1>
      <label>
        Add Groups
        <input
          name="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </label>

      <Link
        key={groupName}
        to={`/lobby/${groupName}`}
        onClick={() => {
          registerGroup(groupName);
          startGame(groupName);
        }}
      >
        <button>Create Lobby</button>
      </Link>
      <ListHeaderText/>
      <ul>{list}</ul>
    </>
  );
}
