import { useEffect, useState } from "react";

export default function Matches() {
  const [matches, setMatches] = useState(null);
  useEffect(() => { fetch("/api/matches").then((r) => r.json()).then((d) => setMatches(d.matches)); }, []);
  if (!matches) return <div className="empty"><p>Loading…</p></div>;
  return (
    <section className="matches">
      <h1>Matches</h1>
      {matches.length === 0 ? (
        <div className="empty"><h2>No matches yet</h2><p>Matches appear here when you and someone else both like each other.</p></div>
      ) : (
        <ul>
          {matches.map((m) => (
            <li key={m.id}>
              <div className="avatar sm" style={{ backgroundImage: `url(${m.photo})` }} />
              <div><strong>{m.name}, {m.age}</strong><span>{m.city}</span></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
