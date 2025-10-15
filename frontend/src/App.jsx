import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";

function App() {
  return (
    <Router>
      <Routes>
         {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
