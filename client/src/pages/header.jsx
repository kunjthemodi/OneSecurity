// Header.jsx
import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import "../components/header.css";

export default function Header() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const dateStr = now.toLocaleDateString();
  const [time, ampm] = now.toLocaleTimeString().split(" ");
  const [h, m, s] = time.split(":");
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <header className="site-header">
      {/* Left */}
      <a
        href="https://hellokunj.netlify.app"
        className="about-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        About Kunj
      </a>


      {/* Right */}
      <div className="live-clock">
        <span className="live-date">
          <FaCalendarAlt className="icon" />
          {dateStr}
        </span>
        <span className="live-time">
          <FaClock className="icon" /> {h}
          <span className="colon">:</span>
          {m}
          <span className="colon">:</span>
          {s} <span className="ampm">{ampm}</span>
        </span>
        <span className="live-zone">{tzName}</span>
      </div>
    </header>
  );
}
