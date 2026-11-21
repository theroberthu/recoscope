"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CATEGORY_POLL, type PollResults } from "@/lib/category-poll.mjs";
import { trackEvent } from "@/lib/analytics";

type Reply = { choice: string | null; results: PollResults | null; preview?: boolean; duplicate?: boolean };

export function CategoryPoll() {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const id = useId();
  const viewed = useRef(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/category-poll", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("unavailable");
        return response.json() as Promise<Reply>;
      })
      .then(setReply)
      .catch(err => { if (err.name !== "AbortError") setError("Voting is temporarily unavailable. You can try again below."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!root.current || !reply || viewed.current || reply.preview) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && !viewed.current) {
        viewed.current = true;
        trackEvent("category_poll_view", { poll_id: CATEGORY_POLL.id, source: "homepage-example" });
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [reply]);

  async function vote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/category-poll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: CATEGORY_POLL.id, option: selected }),
      });
      if (!response.ok) throw new Error("unavailable");
      const result: Reply = await response.json();
      if (!result.choice || !result.results) throw new Error("incomplete response");
      setReply(result);
      if (!result.preview && !result.duplicate) trackEvent("category_poll_vote", {
        poll_id: CATEGORY_POLL.id, category: result.choice, source: "homepage-example",
      });
    } catch {
      setError("Your vote wasn’t saved. Please try again.");
    } finally { setSending(false); }
  }

  const results = reply?.choice ? reply.results : null;
  function renderPoll(headingId: string) {
    return <aside className="category-poll" aria-labelledby={headingId}>
    <p className="editorial-kicker">Help shape the research</p>
    <h3 id={headingId}>What should we benchmark next?</h3>
    <p className="category-poll-deck">Pick a new category for a future AI comparison.</p>
    <noscript><p className="category-poll-note">Enable JavaScript to vote, or use the category suggestion form below.</p></noscript>
    {reply?.preview && <p className="category-poll-preview">Private preview · Test votes only</p>}
    {results ? <div>
      <p className="category-poll-confirmation" role="status">Thanks—your vote is counted.</p>
      <ul className="category-poll-results" aria-label="Current poll results">
        {results.options.map(option => <li key={option.id}>
          <div><span>{option.label}{reply?.choice === option.id && <small> · Your vote</small>}</span><strong>{option.percent}%</strong></div>
          <div className="category-poll-bar" aria-hidden="true"><span style={{ width: `${option.percent}%` }} /></div>
          <span className="category-poll-vote-count">{option.votes} {option.votes === 1 ? "vote" : "votes"}</span>
        </li>)}
      </ul>
      <p className="category-poll-note">{results.total} {results.total === 1 ? "vote" : "votes"} so far · Votes guide future coverage.</p>
    </div> : <form onSubmit={vote} aria-busy={loading || sending}>
      <fieldset disabled={loading || sending}>
        <legend className="sr-only">Choose a category</legend>
        {CATEGORY_POLL.options.map(option => <label className="category-poll-option" key={option.id}>
          <input type="radio" name="next-category" value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} required />
          <span>{option.label}</span>
        </label>)}
      </fieldset>
      <div className="category-poll-actions"><button type="submit" disabled={!selected || loading || sending}>{loading ? "Loading…" : sending ? "Saving…" : "Vote"}<span aria-hidden="true">↗</span></button><a className="category-poll-suggest" href="/request-category#category-request">Suggest another category <span aria-hidden="true">↗</span></a></div>
      <p className="category-poll-note">One vote per browser · No email needed.</p>
    </form>}
    {error && <p className="category-poll-error" role="alert">{error}</p>}
    {results && <a className="category-poll-suggest" href="/request-category#category-request">Suggest another category <span aria-hidden="true">↗</span></a>}
    </aside>;
  }

  return <div className="category-poll-slot" ref={root}>
    <div className="category-poll-desktop">{renderPoll(`${id}-inline-heading`)}</div>
    <div className="category-poll-mobile">
      <button ref={launcher} className="category-poll-launcher" type="button" aria-haspopup="dialog" aria-controls={`${id}-dialog`} aria-expanded={open}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
          if (!reply?.preview) trackEvent("category_poll_open", { poll_id: CATEGORY_POLL.id, source: "homepage-example-mobile" });
        }}>
        <span><strong>{reply?.choice ? "See the category vote" : "Vote for the next category"}</strong><small>{reply?.choice ? "Your vote and the current results" : "Three options · No email needed"}</small></span><span className="category-poll-launch-arrow" aria-hidden="true">↗</span>
      </button>
      <dialog ref={dialog} id={`${id}-dialog`} className="category-poll-dialog" aria-labelledby={`${id}-sheet-heading`}
        onClose={() => { setOpen(false); if (window.matchMedia("(max-width: 760px)").matches) launcher.current?.focus(); }}
        onKeyDown={event => {
          if (event.key !== "Tab") return;
          const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href]")].filter(element => element.getClientRects().length > 0);
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="category-poll-sheet">
          <div className="category-poll-sheet-top"><span aria-hidden="true" /><button type="button" onClick={() => dialog.current?.close()} aria-label="Close poll">Close <span aria-hidden="true">×</span></button></div>
          {renderPoll(`${id}-sheet-heading`)}
        </div>
      </dialog>
    </div>
  </div>;
}
