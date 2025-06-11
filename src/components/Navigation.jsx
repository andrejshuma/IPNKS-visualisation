import React from "react";
import "./Navigation.css";

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>IPNKS Visualisation</h2>
      </div>
      <div className="nav-links">
        <a href="#" className="nav-link">
          Dashboard
        </a>
        <a href="#" className="nav-link">
          Analysis
        </a>
        <a href="#" className="nav-link">
          Settings
        </a>
        <a href="#" className="nav-link">
          Help
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
