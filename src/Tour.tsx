import { useState } from "react"
import { Art, Button } from "./ui"

const STEPS = [
  {
    art: "/assets/james-reading-v1.jpg",
    title: "Today",
    body: "Just today, kept small. Tap Start on a session to follow it step by step, or Done on anything else. Low on energy? Choose “Keep it small”.",
  },
  {
    art: "/assets/writing-nook.jpg",
    title: "Plan",
    body: "The next two weeks. Tap anything to see details and edit it. Swipe left on something to delete it, and you get a few seconds to undo.",
  },
  {
    art: "/assets/movement-path.jpg",
    title: "Journey",
    body: "Your goals and their milestones, your training phases, and the story of what you’ve actually done. Tick a milestone and it’s celebrated.",
  },
  {
    art: "/assets/james-gaming-v2.jpg",
    title: "Studio",
    body: "Ask Studio to plan a workout, move something, log what you did or think something through. It remembers what you told it in About me.",
  },
  {
    art: "/assets/james-cafe-seb-v1.jpg",
    title: "My space",
    body: "Movement, projects, people, money and home, plus About me (what Studio knows about you) and Settings. The ☰ menu has quick ways in, and the full guide to everything if you ever get stuck.",
  },
]

// A short first look around after setup. You can take it again from About me.
export function Tour({ onDone, onGuide }: { onDone: () => void; onGuide: () => void }) {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const last = index === STEPS.length - 1
  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour__card">
        <Art className="tour__art" src={step.art} />
        <div className="tour__body">
          <p className="eyebrow">
            A quick look around · {index + 1} of {STEPS.length}
          </p>
          <h2 id="tour-title">{step.title}</h2>
          <p>{step.body}</p>
          <div className="tour__dots" aria-hidden="true">
            {STEPS.map((item, position) => (
              <i key={item.title} className={position === index ? "is-active" : ""} />
            ))}
          </div>
          <div className="tour__actions">
            {!last && (
              <button type="button" className="text-link" onClick={onDone}>
                Skip
              </button>
            )}
            {index > 0 && (
              <Button variant="ghost" onClick={() => setIndex(index - 1)}>
                Back
              </Button>
            )}
            {last && (
              <Button variant="secondary" onClick={onGuide}>
                Read the full guide
              </Button>
            )}
            <Button onClick={() => (last ? onDone() : setIndex(index + 1))}>{last ? "Start" : "Next"}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
