import { useEffect, useState } from "react";
import Connector from "../Connection/signalr";
import { Link } from "react-router-dom";

export default function Login() {
  const { events, registerClient, getGroups } = Connector();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const handleGroups = () => {
    };
    const handleClientJoin = (username: string) => {
      setUserName(username);
    };
    events(handleGroups, handleClientJoin);
  });
  return (
    <>
      <label>
        Username
        <input
          name="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </label>
      <Link
        to="/lobby"
        onClick={() => {
          registerClient(userName);
          getGroups();
        }}
      >
        <button>Register</button>
      </Link>
    </>
  );
}
