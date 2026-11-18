import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

const THRESHOLD = 110;

const Card = forwardRef(function Card({ profile, onSwipe }, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [20, THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-THRESHOLD, -20], [1, 0]);
  const busy = useRef(false);

  const fling = useCallback(async (dir) => {
    if (busy.current) return;
    busy.current = true;
    await animate(x, dir === "like" ? 700 : -700, { duration: 0.28, ease: "easeIn" });
    onSwipe(dir);
  }, [x, onSwipe]);
  useImperativeHandle(ref, () => ({ fling }), [fling]);

  return (
    <motion.article
      className="card top"
      style={{ x, rotate, touchAction: "pan-y" }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > THRESHOLD || info.velocity.x > 600) fling("like");
        else if (info.offset.x < -THRESHOLD || info.velocity.x < -600) fling("pass");
      }}
    >
      <CardBody p={profile} />
      <motion.span className="stamp like" style={{ opacity: likeOpacity }}>Like</motion.span>
      <motion.span className="stamp nope" style={{ opacity: nopeOpacity }}>Pass</motion.span>
    </motion.article>
  );
});

function CardBody({ p }) {
  return (
    <>
      <div className="photo" style={{ backgroundImage: `url(${p.photo})` }} />
      <div className="info">
        <h2>{p.name}, {p.age}</h2>
        <p className="city">{p.city}</p>
        <p className="bio">{p.bio}</p>
        <ul className="chips">{p.interests.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
    </>
  );
}

export default function Discover({ onSeeMatches }) {
  const [queue, setQueue] = useState(null);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    fetch("/api/feed").then((r) => r.json()).then((d) => setQueue(d.profiles)).catch(() => setError("Couldn't load profiles. Check your connection and refresh."));
  }, []);

  const handleSwipe = useCallback(async (dir) => {
    const p = queue[0];
    setQueue((q) => q.slice(1)); // a swiped profile leaves the stack immediately
    try {
      const res = await fetch("/api/swipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId: p.id, direction: dir }) });
      const data = await res.json();
      if (data.match) setMatch(data.profile);
    } catch { setError("Your last swipe may not have saved. Refresh to check."); }
  }, [queue]);

  if (error && !queue) return <div className="empty"><h2>Something went wrong</h2><p>{error}</p></div>;
  if (!queue) return <div className="empty"><p>Loading profiles…</p></div>;

  return (
    <section className="discover">
      {error && <p className="toast" role="alert">{error}</p>}
      {queue.length === 0 ? (
        <div className="empty">
          <h2>You're all caught up</h2>
          <p>No new profiles right now. Check back later, or see who you've matched with.</p>
          <button className="primary" onClick={onSeeMatches}>See matches</button>
        </div>
      ) : (
        <>
          <div className="stack">
            {queue[1] && <article className="card behind" key={queue[1].id}><CardBody p={queue[1]} /></article>}
            <Card key={queue[0].id} ref={cardRef} profile={queue[0]} onSwipe={handleSwipe} />
          </div>
          <div className="actions">
            <button className="round pass" aria-label="Pass" onClick={() => cardRef.current?.fling("pass")}>✕</button>
            <button className="round like" aria-label="Like" onClick={() => cardRef.current?.fling("like")}>♥</button>
          </div>
        </>
      )}
      {match && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="It's a match">
          <motion.div className="matchbox" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
            <h1>It's a match!</h1>
            <div className="avatar" style={{ backgroundImage: `url(${match.photo})` }} />
            <p>You and {match.name} liked each other.</p>
            <button className="primary" onClick={() => { setMatch(null); onSeeMatches(); }}>View matches</button>
            <button className="ghost" onClick={() => setMatch(null)}>Keep swiping</button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
