import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LobbyScreen } from "./screens/LobbyScreen";
import { RoomScreen } from "./screens/RoomScreen";
import { GameSessionProvider } from "./session/GameSessionProvider";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LobbyScreen />} />
      <Route path="/room/:code" element={<RoomScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GameSessionProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GameSessionProvider>
  );
}
