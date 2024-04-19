import "./App.scss";
// import Demo from "./proj/Connection/demo";
import Board from "./proj/Game/Board/board";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./proj/Lobby/login";
import Lobby from "./proj/Lobby/lobby";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path:"lobby",
    element: <Lobby />
  },
  {
    path:"lobby/:lobbyId",
    element: <Board />
  },
]);

function App() {
  return (
    <>
      {/* <Board />
      <Demo /> */}
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
