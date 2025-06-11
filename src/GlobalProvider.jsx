import React, { createContext, useState, useContext } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedGraphLayout, setSelectedGraphLayout] = useState("random");
    const [nodeAddSize, setNodeAddSize] = useState(0);
    const [edgeAddSize, setEdgeAddSize] = useState(0);

    return (
        <GlobalContext.Provider
            value={{
                selectedNode,
                setSelectedNode,
                selectedGraphLayout,
                setSelectedGraphLayout,
                nodeAddSize,
                setNodeAddSize,
                edgeAddSize,
                setEdgeAddSize
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
