import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import SignUpPage from "./views/SignUpPage";
import HomePage from "./views/HomePage";
import LogInPage from "./views/LogInPage";
import AddArticlePage from "./views/AddArticlePage.js"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/add-article" element={<AddArticlePage />} />
      </Routes>
    </Router>
  );
}

export default App;
