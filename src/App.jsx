import { useState } from "react";
import Discover from "./components/Discover.jsx";
import Matches from "./components/Matches.jsx";

const TABS = [["home", "Home"], ["discover", "Discover"], ["matches", "Matches"]];

export default function App() {
  const [tab, setTab] = useState("discover");
  return (
    <div className="shell">
      <main className="main">
        {tab === "home" && null /* intentionally blank */}
        {tab === "discover" && <Discover onSeeMatches={() => setTab("matches")} />}
        {tab === "matches" && <Matches />}
      </main>
      <nav className="tabs" aria-label="Main">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} aria-current={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
