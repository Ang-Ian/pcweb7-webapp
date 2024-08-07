import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import SignUpPage from "./views/SignUpPage.js";
import HomePage from "./views/HomePage.js";
import LogInPage from "./views/LogInPage.js";
import AddArticlePage from "./views/AddArticlePage.js"
import ArticleDetailsPage from "./views/ArticleDetailsPage.js"
import ArticleEditPage from "./views/ArticleEditPage.js"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/add-article" element={<AddArticlePage />} />
        <Route path="/article/:id/" element={<ArticleDetailsPage />} />
        <Route path="/edit-article/:id/" element={<ArticleEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
