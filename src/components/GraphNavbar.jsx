import React, { useState } from "react";
import "./GraphNavbar.css";
import jsonData from "../assets/diplomas.json";
import { useGlobalContext } from "../GlobalProvider.jsx";
import { node } from "globals";

const GraphNavbar = () => {
  const { selectedGraphLayout, setSelectedGraphLayout } = useGlobalContext();
  const { nodeAddSize, setNodeAddSize } = useGlobalContext();
  const { edgeAddSize, setEdgeAddSize } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const uniquePeople = new Set();
  const edgeCount = new Set();

  const mentors = [
    ...new Set(
      [
        ...jsonData.map((item) => item.mentor),
        ...jsonData.map((item) => item.member1),
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

  jsonData.forEach((data) => {
    const { mentor, member1, member2 } = data;
    uniquePeople.add(mentor);
    uniquePeople.add(member1);
    uniquePeople.add(member2);

    const edges = [
      [mentor, member1],
      [mentor, member2],
    ];

    edges.forEach(([a, b]) => {
      const sortedKey = [a, b].sort().join("-");
      edgeCount.add(sortedKey);
    });
  });

  return (
    <div className="graph-navbar">
      <div className="navbar-section">
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
          <label className="search-label">Пребарај ментор:</label>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
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
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
          <label className="search-label">Мин Колаборации:</label>
          <input type="number" className="search-input-number" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
          <label className="search-label">Макс Колаборации:</label>
          <input type="number" className="search-input-number" />
        </div>
        <button
          className={`control-btn ${
            selectedGraphLayout === "circular" ? "control-btn-active" : ""
          }`}
          onClick={() => setSelectedGraphLayout("circular")}
        >
          Кружен
        </button>
        <button
          className={`control-btn ${
            selectedGraphLayout === "random" ? "control-btn-active" : ""
          }`}
          onClick={() => setSelectedGraphLayout("random")}
        >
          Случаен
        </button>
      </div>

      <div className="navbar-section">
        <div className="control-group">
          <label>Големина на јазли:</label>
          <input
            type="range"
            min="0"
            max="5"
            value={nodeAddSize}
            onChange={(e) => setNodeAddSize(Number(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Големина на ребра:</label>
          <input
            type="range"
            min="1"
            max="3"
            value={edgeAddSize}
            onChange={(e) => setEdgeAddSize(Number(e.target.value))}
          />
        </div>
        <div className="stats-inline">
          <span className="stat-item">Членови: {uniquePeople.size}</span>
          <span className="stat-item">Соработки: {jsonData.length * 2}</span>
        </div>
      </div>
    </div>
  );
};

export default GraphNavbar;
