import { useState } from "react";
import { FloatingLabel, Form, Button  } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Connector from "../Connection/signalr";
import "./login.scss";

export default function Login() {
  const { registerClient, getGroups } = Connector();
  const [validated, setValidated] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      registerClient(name);
      getGroups();
      navigate("/lobby");
    }
    setValidated(true);
  };

  return (
    <>
      <h1 className="title">GOMOKU</h1>
      <div className="name-input-field">
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <FloatingLabel
            controlId="floatingInput"
            label="Username"
            className="name-form"
          >
            <Form.Control
              type="text"
              placeholder=""
              required
              name="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please choose a username.
            </Form.Control.Feedback>
            <Button type="submit">Register</Button>
          </FloatingLabel>
        </Form>
      </div>
    </>
  );
}
