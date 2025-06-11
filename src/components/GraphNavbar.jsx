import React, { useState } from "react";
import "./GraphNavbar.css";
import jsonData from "../assets/demoData.json";

const GraphNavbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract unique mentors from the JSON data
  const mentors = [
    ...new Set(
      [
        ...jsonData.map((item) => item.mentor),
        ...jsonData.map((item) => item.member),
        ...jsonData.map((item) => item.member2),
      ].filter(Boolean)
    ),
  ].sort();

  // Filter mentors based on search term
  const filteredMentors = mentors.filter((mentor) =>
    mentor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (mentor) => {
    setSearchTerm(mentor);
    setShowSuggestions(false);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="graph-navbar">
      <div className="navbar-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search mentors..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            onBlur={handleSearchBlur}
          />
          {showSuggestions && filteredMentors.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredMentors.slice(0, 5).map((mentor, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(mentor)}
                >
                  {mentor}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-section">
        <h4>Layout</h4>
        <div className="control-group">
          <label>Node Size:</label>
          <input type="range" min="5" max="20" defaultValue="10" />
        </div>
        <div className="control-group">
          <label>Edge Thickness:</label>
          <input type="range" min="1" max="5" defaultValue="2" />
        </div>
        <div className="control-group">
          <button className="control-btn">Circular</button>
          <button className="control-btn">Random</button>
        </div>
      </div>

      <div className="navbar-section">
        <h4>Statistics</h4>
        <div className="stats-inline">
          <span className="stat-item">Nodes: {jsonData.length}</span>
          <span className="stat-item">
            Edges: {(jsonData.length * jsonData.length) / 2}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GraphNavbar;
