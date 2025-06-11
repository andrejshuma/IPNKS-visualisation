import React from "react";
import "./Navigation.css";
import finkiLogo from "../assets/finki_mk.png"; // Adjust the path as necessary

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <img
          src={finkiLogo}
          alt="Brand Logo"
          style={{ height: "auto", width: "18rem" }}
        />
      </div>
    </nav>
  );
};

export default Navigation;
