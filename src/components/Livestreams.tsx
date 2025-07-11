import React, { useEffect, useState } from "react";
import "../styles/livestreams.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultStreamers = [
  "ott4",
  "heyitsyolo",
  "cupseyy",
  "dvces",
  "kreo",
  "cented",
  "dustdotsol",
  "betwithsize",
];

function shuffle(array: string[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Livestreams() {
  const [streamers, setStreamers] = useState<string[]>([]);
  const [columns, setColumns] = useState<number>(1);
  const [newStreamer, setNewStreamer] = useState<string>("");
  const [loadedStreamers, setLoadedStreamers] = useState<Set<string>>(new Set());
  const [visibleStreamers, setVisibleStreamers] = useState<string[]>([]);

  useEffect(() => {
    setStreamers(shuffle(defaultStreamers));
  }, []);

  // Atualiza streamers visíveis baseado no carregamento
  useEffect(() => {
    if (streamers.length === 0) return;

    // Sempre mostra o primeiro streamer
    const newVisible = [streamers[0]];
    
    // Adiciona os próximos streamers se os anteriores já carregaram
    for (let i = 1; i < streamers.length; i++) {
      const previousStreamer = streamers[i - 1];
      if (loadedStreamers.has(previousStreamer)) {
        newVisible.push(streamers[i]);
      } else {
        break; // Para no primeiro streamer que não carregou
      }
    }
    
    setVisibleStreamers(newVisible);
  }, [streamers, loadedStreamers]);

  const handleStreamLoad = (streamerName: string) => {
    setLoadedStreamers(prev => new Set([...prev, streamerName]));
  };

  const handleAddStreamer = () => {
    const trimmed = newStreamer.trim().toLowerCase();
    if (trimmed && !streamers.includes(trimmed)) {
      setStreamers((prev) => [trimmed, ...prev]);
      setNewStreamer("");

      toast.success("Streamer " + trimmed + " added successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });
    }
  };

  const handleRemoveStreamer = (name: string) => {
    setStreamers((prev) => prev.filter((s) => s !== name));
    setLoadedStreamers(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const parentDomain = "trenchsocial-frontend.vercel.app";

  return (
    <div className="stream-side">
      <div className="main-div">
        <div className="header">
          <span className="title">Watch Live Trenchers</span>

          <div className="column-buttons">
            <button
              className={columns === 1 ? "active" : ""}
              onClick={() => setColumns(1)}
            >
              1
            </button>
            <button
              className={columns === 2 ? "active" : ""}
              onClick={() => setColumns(2)}
            >
              2
            </button>
          </div>
        </div>

        <div className="add-streamer">
          <input
            type="text"
            placeholder="New streamer username"
            value={newStreamer}
            onChange={(e) => setNewStreamer(e.target.value)}
          />
          <button onClick={handleAddStreamer}>
            <svg
              stroke="currentColor"
              fill="white"
              style={{ backgroundColor: "transparent" }}
              strokeWidth="0"
              viewBox="0 0 448 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
            </svg>
          </button>
        </div>

        <div className={`streams-container columns-${columns}`}>
          {visibleStreamers.map((streamer, index) => (
            <div key={streamer} className="stream-wrapper">
              <button
                style={{ fontSize: "0.8rem" }}
                className="remove-button"
                onClick={() => handleRemoveStreamer(streamer)}
                title="Remove"
              >
                ❌
              </button>
              <div className="stream-info">
                <a
                  href={`https://twitch.tv/${streamer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{streamer}
                </a>
              </div>
              <iframe
                src={`https://player.twitch.tv/?channel=${streamer}&parent=${parentDomain}${
                  index === 0 ? "&autoplay=true" : "&autoplay=false"
                }`}
                height="500"
                width="100%"
                allowFullScreen
                onLoad={() => handleStreamLoad(streamer)}
              ></iframe>
            </div>
          ))}
          
          {streamers.length > visibleStreamers.length && (
            <div className="stream-wrapper loading-placeholder">
              <div className="stream-info">
                <span style={{backgroundColor:"transparent", color:"white", padding:"5px"}}>Loading streamer</span>
              </div>
              <div style={{ 
                height: "500px", 
                backgroundColor: "#f0f0f0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                color: "#666"
              }}>
                <div>
                  <div style={{backgroundColor:"#f0f0f0", color:"black"}}>⏳ Loading ...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}