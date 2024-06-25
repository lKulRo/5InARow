import { useEffect, useState } from "react";
import Connector, { Group } from "../Connection/signalr";
import { Link, useNavigate } from "react-router-dom";
import { Button, FloatingLabel, Form, ListGroup } from "react-bootstrap";
import "./lobby.scss";

export default function Login() {
  const { events, registerGroup, startGame } = Connector();
  const [userName, setUserName] = useState("");
  const [groups, setGroups] = useState(Array<Group>);
  const [groupName, setGroupName] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleGroups = (groups: Array<Group>) => {
      setGroups(groups);
    };
    const handleClientJoin = (username: string) => {
      setUserName(username);
    };
    events(handleGroups, handleClientJoin);
  });
  
  function GroupList() {
    return groups.map((group) => (
      <ListGroup horizontal>
        <ListGroup.Item>
          <Link
            key={group.groupName}
            to={group.clients.length < 2 ? `/lobby/${group.groupName}` : "#"}
            onClick={() => {
              registerGroup(group.groupName);
              startGame(group.groupName);
            }}
          >
            <Button disabled={group.clients.length >= 2}>
              {group.groupName}
            </Button>
          </Link>
        </ListGroup.Item>
        <ListGroup.Item>{group.clients.length}/2</ListGroup.Item>
      </ListGroup>
    ));
  }

  function ListHeaderText() {
    if (groups.length > 0) {
      return <h2>Lobbies:</h2>;
    } else {
      return <h2>No open lobbies currently, try create one</h2>;
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      registerGroup(groupName);
      startGame(groupName);
      navigate(`/lobby/${groupName}`);
    }

    setValidated(true);
  };

  return (
    <>
      <h1>Gomoku</h1>
      <div className="user-area">Hello {userName}</div>

      <div className="group-input-field">
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <FloatingLabel
            controlId="floatingInput"
            label="Create new group"
            className="group-form"
          >
            <Form.Control
              type="text"
              placeholder=""
              required
              name="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a name for a group.
            </Form.Control.Feedback>
            <Button type="submit">Create Group</Button>
          </FloatingLabel>
        </Form>
      </div>

      <ListHeaderText />
      <GroupList />
    </>
  );
}
