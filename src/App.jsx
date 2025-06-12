import { useState } from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import GraphNavbar from "./components/GraphNavbar";
import GraphViewMentors from "./components/GraphViewMentors.jsx";

function App() {
  return (
    <div className="app">
      <Navigation />
      <div className="app-body">
        <main className="main-content">
          <GraphNavbar />
          <GraphViewMentors />
        </main>
        <Sidebar />
      </div>
    </div>
  );
}

export default App;
