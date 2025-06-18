import React, { useState } from "react";
import "./GraphNavbar.css";
import jsonData from "../assets/diplomas.json";
import { useGlobalContext } from "../GlobalProvider.jsx";

const GraphNavbar = () => {
  const { selectedGraphLayout, setSelectedGraphLayout } = useGlobalContext();
  const { nodeAddSize, setNodeAddSize } = useGlobalContext();
  const { edgeAddSize, setEdgeAddSize } = useGlobalContext();
  const { searchedMentor, setSearchedMentor } = useGlobalContext();
  const {
    minInteractions,
    setMinInteractions,
    maxInteractions,
    setMaxInteractions,
    activeNodeFilter,
    setActiveNodeFilter,
  } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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
    setSelectedSuggestionIndex(-1); // Reset selection when typing
  };

  const handleSearchKeyDown = (e) => {
    if (!showSuggestions || filteredMentors.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredMentors.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMentors.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selectedMentor = filteredMentors[selectedSuggestionIndex];
          handleSuggestionClick(selectedMentor);
        } else if (filteredMentors.length > 0) {
          const firstMatch = filteredMentors[0];
          handleSuggestionClick(firstMatch);
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (mentor) => {
    const cleanMentorName = mentor.split("-")[0].trim();
    setSearchTerm(mentor);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSearchedMentor(cleanMentorName);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  };

  const handleApplyFilter = () => {
    const min = minInteractions === "" ? null : parseInt(minInteractions, 10);
    const max = maxInteractions === "" ? null : parseInt(maxInteractions, 10);
    setActiveNodeFilter({ min, max });
  };

  const handleResetFilter = () => {
    setMinInteractions("");
    setMaxInteractions("");
    setActiveNodeFilter({ min: null, max: null });
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
    <div
      className="graph-navbar"
      data-stats={`Членови: ${uniquePeople.size} | Соработки: ${
        jsonData.length * 2
      }`}
    >
      {/* Desktop Layout */}
      <div className="desktop-layout">
        <div className="navbar-section">
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
            <label className="search-label">Пребарај ментор:</label>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() =>
                  searchTerm.length > 0 && setShowSuggestions(true)
                }
                onBlur={handleSearchBlur}
              />
              {showSuggestions && filteredMentors.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredMentors.slice(0, 5).map((mentor, index) => (
                    <div
                      key={index}
                      className={`suggestion-item ${
                        index === selectedSuggestionIndex
                          ? "suggestion-item-selected"
                          : ""
                      }`}
                      onClick={() => handleSuggestionClick(mentor)}
                    >
                      {mentor}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: ".4rem" }}
            className="min-collab-container"
          >
            <label className="search-label">Мин Колаборации:</label>
            <input
              type="number"
              className="search-input-number"
              value={minInteractions}
              onChange={(e) => setMinInteractions(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: ".4rem" }}
            className="max-collab-container"
          >
            <label className="search-label">Макс Колаборации:</label>
            <input
              type="number"
              className="search-input-number"
              value={maxInteractions}
              onChange={(e) => setMaxInteractions(e.target.value)}
              placeholder="∞"
              min="0"
            />
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: ".4rem" }}
            className="filter-buttons-container"
          >
            <button
              className="control-btn"
              onClick={handleApplyFilter}
              style={{
                backgroundColor: "#28a745",
                color: "white",
              }}
            >
              Примени
            </button>
            <button
              className="control-btn"
              onClick={handleResetFilter}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
              }}
            >
              Ресетирај
            </button>
          </div>
        </div>

        <div className="navbar-section">
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

      {/* Mobile/Tablet Layout */}
      <div className="mobile-layout">
        {/* Search Card */}
        <div className="control-card search-card">
          <div className="search-container">
            <input
              type="text"
              className="search-input-mobile"
              placeholder="Внеси име на ментор..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
              onBlur={handleSearchBlur}
            />
            {showSuggestions && filteredMentors.length > 0 && (
              <div className="suggestions-dropdown">
                {filteredMentors.slice(0, 5).map((mentor, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${
                      index === selectedSuggestionIndex
                        ? "suggestion-item-selected"
                        : ""
                    }`}
                    onClick={() => handleSuggestionClick(mentor)}
                  >
                    {mentor}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Card - Hidden on phone */}
        <div className="control-card filter-card">
          <div className="card-header">
            <h4>🎚️ Филтер</h4>
          </div>
          <div className="filter-inputs">
            <div className="input-group min-filter-group">
              <label>Мин</label>
              <input
                type="number"
                className="filter-input"
                value={minInteractions}
                onChange={(e) => setMinInteractions(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="input-group max-filter-group">
              <label>Макс</label>
              <input
                type="number"
                className="filter-input"
                value={maxInteractions}
                onChange={(e) => setMaxInteractions(e.target.value)}
                placeholder="∞"
                min="0"
              />
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn-apply" onClick={handleApplyFilter}>
              Примени
            </button>
            <button className="btn-reset" onClick={handleResetFilter}>
              Ресетирај
            </button>
          </div>
        </div>

        {/* Layout & Controls Card */}
        <div className="control-card layout-card">
          <div className="layout-buttons">
            <button
              className={`layout-btn ${
                selectedGraphLayout === "circular" ? "active" : ""
              }`}
              onClick={() => setSelectedGraphLayout("circular")}
            >
              <span className="btn-icon">○</span>
              Кружен
            </button>
            <button
              className={`layout-btn ${
                selectedGraphLayout === "random" ? "active" : ""
              }`}
              onClick={() => setSelectedGraphLayout("random")}
            >
              <span className="btn-icon">⚡</span>
              Случаен
            </button>
          </div>

          <div className="size-controls">
            <div className="size-control">
              <label>Јазли</label>
              <input
                type="range"
                min="0"
                max="5"
                value={nodeAddSize}
                onChange={(e) => setNodeAddSize(Number(e.target.value))}
                className="range-slider"
              />
              <span className="range-value">{nodeAddSize}</span>
            </div>
            <div className="size-control">
              <label>Ребра</label>
              <input
                type="range"
                min="1"
                max="3"
                value={edgeAddSize}
                onChange={(e) => setEdgeAddSize(Number(e.target.value))}
                className="range-slider"
              />
              <span className="range-value">{edgeAddSize}</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="control-card stats-card">
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-number">{uniquePeople.size}</span>
              <span className="stat-label">Членови</span>
            </div>
            <div className="stat">
              <span className="stat-number">{jsonData.length * 2}</span>
              <span className="stat-label">Соработки</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphNavbar;
