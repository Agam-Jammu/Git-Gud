import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppMotionProvider } from "./motion/AppMotionProvider";
import { LobbyScreen } from "./screens/LobbyScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { RoomScreen } from "./screens/RoomScreen";
import { GameSessionProvider } from "./session/GameSessionProvider";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LobbyScreen />} />
      <Route path="/practice" element={<PracticeScreen />} />
      <Route path="/room/:code" element={<RoomScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppMotionProvider>
      <GameSessionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </GameSessionProvider>
    </AppMotionProvider>
  );
}
