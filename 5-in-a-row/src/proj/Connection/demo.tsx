import { useEffect, useState } from "react";
import Connector, { Group } from "./signalr";
import "./demo.scss";

function Demo() {
  const { events, registerClient, getGroups, registerGroup } =
    Connector();
  // const [message, setMessage] = useState("initial value");

  // const [name, setName] = useState("");
  // const [roomName, setRoomName] = useState("");
  const [groups, setGroups] = useState(Array<Group>);
  const [userName, setUserName] = useState("");
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
      <button
        onClick={() => {
          registerGroup(groupName);
        }}
      >
        {x.groupName}
      </button>
    </li>
  ));
  const nameSetted = () => {
    if (userName != "") {
      return <span>my name is {userName}</span>;
    } else {
      return <span>Please tell us your name</span>;
    }
  };

  return (
    <div className="Demo">
      {/* <label>
        Name:
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        RoomName
        <input
          name="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </label>
      <span>
        message from signalR:{" "}
        <span style={{ color: "green" }}>
          {name} sent:{message}
        </span>{" "}
      </span>
      <br />
      <button onClick={() => newMessage(name, roomName)}>send</button> */}

      <label>
        Username
        <input
          name="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </label>
      <button
        onClick={() => {
          registerClient(userName);
          getGroups();
        }}
      >
        send
      </button>
      {nameSetted()}
      <label>
        Add Groups
        <input
          name="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </label>
      <button
        onClick={() => {
          registerGroup(groupName);
        }}
      >
        send
      </button>
      <ul>{list}</ul>
    </div>
  );
}
export default Demo;
