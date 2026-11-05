import { ArrowLeft, ArrowRight, Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { SpaceKey } from "./assistant"
import { Art, Button, Modal } from "./ui"

export type GuideRoute = "today" | "plan" | "progress" | "space"
export type GuideTarget = { route: GuideRoute } | { space: SpaceKey } | { studio: true }

type Topic = { title: string; body: string; steps?: string[] }
type Chapter = {
  title: string
  summary: string
  art: string
  go?: { label: string; target: GuideTarget }
  topics: Topic[]
}

const CHAPTERS: Chapter[] = [
  {
    title: "Start here",
    summary: "What this is, how to get around, and the two things to set up.",
    art: "/assets/james-reading-v1.jpg",
    topics: [
      {
        title: "What Life Studio is",
        body: "A calm place for your plans, movement, projects, people, money, sleep and notes, with an assistant called Studio that can do most of the admin for you. Plans here are plans, not promises. Moving or skipping something is always fine.",
      },
      {
        title: "The four tabs",
        body: "The bar along the bottom (the left side on a laptop) has everything:",
        steps: [
          "Today: just today, kept small.",
          "Plan: the next two weeks, day by day.",
          "Journey: your goals, your training route and the story of what you’ve done.",
          "My space: every other room, plus About me and Settings.",
        ],
      },
      {
        title: "Two shortcuts that work from anywhere",
        body: "The round chat button in the middle of the bottom bar opens Studio. On a laptop it’s the Studio assistant button on the left. The ☰ button at the top right of your phone opens the Quick menu: lights out, log something, add to plan, journal, breathe, voice note and more.",
      },
      {
        title: "Set up 1: enter your passcode",
        body: "Studio and syncing need your private passcode. Without it the app still works on this device, but Studio can only give simple offline suggestions.",
        steps: [
          "Go to My space, then Settings, sync & backup.",
          "Find Sync across devices and enter the passcode you were given.",
          "Enter the same passcode on any other device you use.",
        ],
      },
      {
        title: "Set up 2: put it on your Home Screen",
        body: "It then opens like a normal app. On an iPhone, this is also the only way to get notifications.",
        steps: [
          "On iPhone, open the site in Safari and tap Share, then Add to Home Screen.",
          "Open Life Studio from that new icon from now on.",
          "Turn on notifications in My space, then Settings, sync & backup.",
        ],
      },
      {
        title: "You can’t really break it",
        body: "Delete something by mistake and you get a few seconds to undo it. Studio shows you what it wants to change before anything happens. The only button to be careful with is Start fresh in Settings, which wipes everything, and it asks you first.",
      },
    ],
  },
  {
    title: "Today",
    summary: "The screen you’ll use most, and how it changes through the day.",
    art: "/assets/james-walks-seb-v1.jpg",
    go: { label: "Go to Today", target: { route: "today" } },
    topics: [
      {
        title: "How much room is there today?",
        body: "A quick check-in that changes what Today shows. Change it whenever you like.",
        steps: [
          "Keep it small: tucks optional plans away and puts short versions first.",
          "Steady: your plan as it is.",
          "Room to explore: everything shows, plus one extra idea you can add.",
        ],
      },
      {
        title: "Today’s shape",
        body: "What’s on today, with the next thing marked Up next. Use Add to put something in. If there’s more than fits, tap “more today” to see the rest. Everyday items have Done and Open. Open shows the details so you can change them.",
      },
      {
        title: "Something came up?",
        body: "Tap “Something came up? Studio can reshuffle” and say what’s changed, like “working late tonight” or “away Saturday”. Studio suggests new days and times, and you decide whether to accept them.",
      },
      {
        title: "Lights on and Lights out",
        body: "Tap Lights out when you go to bed and Lights on when you get up. On your phone, the card comes to the top about an hour before your bedtime and stays until you’re up and have said how you slept. The rest of the day, the check-in and Today’s shape lead.",
      },
      {
        title: "Further down the page",
        body: "These shift with the time of day:",
        steps: [
          "Next useful action: the one thing to do next, with a link to Your journey.",
          "Pocket of happiness: one small good thing from today, kept in your jar.",
          "How was today, in one line? and Tomorrow: in the evening, a line for your journal and a peek ahead.",
          "A quiet corner and Drop into a space: quick ways to breathe, write, or jump to a room.",
        ],
      },
    ],
  },
  {
    title: "Plan",
    summary: "Add, change, repeat and remove things across two weeks.",
    art: "/assets/writing-nook.jpg",
    go: { label: "Go to Plan", target: { route: "plan" } },
    topics: [
      {
        title: "Add something",
        body: "Pick a day at the top, then tap Add something. Or tell Studio, like “coffee with Sam on Friday at 11”.",
      },
      {
        title: "Change something",
        body: "Tap Open (or the item) to change any of these, then Save changes:",
        steps: [
          "Name, day, time and minutes.",
          "How fixed it is: a fixed commitment, flexible, or optional.",
          "Which part of life it belongs to.",
          "Notes, and whether it repeats.",
          "Remind me before this, for the ones that matter.",
        ],
      },
      {
        title: "Things that repeat",
        body: "Set Repeats when you edit an item. When you later change or delete one, you choose whether it applies to only this one or this and all future ones.",
      },
      {
        title: "Delete, or let it go",
        body: "Swipe left on an item to delete it, then undo within a few seconds if you change your mind. On a laptop, use the small ‹ handle on its right edge. Let it go keeps it instead: it moves to Set aside at the bottom of Plan, where you can bring it back.",
      },
      {
        title: "Each kind of plan has its own extras",
        body: "Open an item to find them:",
        steps: [
          "Movement: start it, take a short version, edit the exercises, or use one of your workouts.",
          "People: note who it’s with. Marking it done remembers when you last connected.",
          "Making something: link it to a project so it counts as a step.",
          "Reflecting: write a few lines and they’re saved to your journal.",
          "Life admin and home: break it into small steps.",
        ],
      },
      {
        title: "Suggestions and planning next week",
        body: "When Studio plans a week, those sessions show as suggestions for you to accept or change. Near the end of the week, Today offers to plan next week. You can repeat this week or have Studio build on how it went: small steps up when it felt good, the same again when it was hard.",
      },
    ],
  },
  {
    title: "Doing a session",
    summary: "What Start, Short version, Done, Move and Skip each do.",
    art: "/assets/movement-path.jpg",
    go: { label: "See today’s sessions", target: { route: "today" } },
    topics: [
      {
        title: "The five buttons",
        body: "Movement sessions have these on Today and Plan:",
        steps: [
          "Start: follow the session step by step.",
          "Short version: a smaller version, when the session has one.",
          "Done: you did it, so log what you actually did.",
          "Move: put it on another day.",
          "Skip: not today, no fuss.",
        ],
      },
      {
        title: "Your first gym session",
        body: "Studio asks a few questions first: how active you are, what’s comfortable, your gym experience, your equipment and your time. These shape the session. You can change your answers later.",
      },
      {
        title: "During a gym session",
        body: "Work through the exercises and tap Complete set as you go, then say how hard it felt. You can change exercises before you start with Edit exercises. If you’re choosing a weight, go for one you could lift 3 or 4 more times.",
      },
      {
        title: "Save a session you liked",
        body: "After logging a session, tick “Save as one of my workouts”. You can reuse it from Movement, under My workouts.",
      },
      {
        title: "If something hurts",
        body: "Turn on “Anything affecting exercise right now?” in About me and say what it is. Studio then only suggests gentle options until you turn it off. If your answers suggest demanding training should wait, the app offers an easy walk instead. This app isn’t medical advice, so check anything worrying with a doctor or physio.",
      },
    ],
  },
  {
    title: "Studio",
    summary: "Your assistant: what to ask, and how it makes changes.",
    art: "/assets/james-gaming-v2.jpg",
    go: { label: "Open Studio", target: { studio: true } },
    topics: [
      {
        title: "Talking to Studio",
        body: "Tap the round chat button and type, or tap the microphone and speak. On an iPhone it may ask you to tap the 🎤 on your keyboard instead.",
      },
      {
        title: "Things you can ask",
        body: "Say it however it comes out:",
        steps: [
          "“Plan me a 30 minute workout for tomorrow.”",
          "“Move the gym to Thursday.”",
          "“I walked Seb for 25 minutes, felt easy.”",
          "“I’m working late tonight, what can give?”",
          "“I want to be able to run 5k by summer. How do I get there?”",
          "“Help me think through this project.”",
        ],
      },
      {
        title: "Nothing changes until you say yes",
        body: "When Studio wants to change your plan, it shows you what it’s suggesting first. Accept it, ignore it, or ask for something different.",
      },
      {
        title: "Looking things up",
        body: "Tap the globe next to the message box before you send, and Studio searches the web for that one message and shows its sources.",
      },
      {
        title: "What it knows about you",
        body: "Studio goes by About me. If it gets something wrong or out of date, go to About me and use “Studio has something wrong?”: say what’s no longer true and it finds every old mention and cleans them up.",
      },
      {
        title: "When Studio can’t help right now",
        body: "If it asks for your passcode, enter it in Settings. If you’re offline, you’ll see a simple offline suggestion instead. Studio can get things wrong, so check anything important.",
      },
    ],
  },
  {
    title: "Journey",
    summary: "Goals, milestones, events, your training route and your story.",
    art: "/assets/james-solo-travel-v2.jpg",
    go: { label: "Go to Journey", target: { route: "progress" } },
    topics: [
      {
        title: "This week",
        body: "A look at your week so far and what’s coming up. Tap Summarise my week and Studio writes it up for you.",
      },
      {
        title: "Goals: Heading towards",
        body: "One calm row for each goal, with its next milestone, progress and countdown. Tap New goal and choose whether it’s a smaller or bigger one. Tap a goal to see or edit it. Tidy up lets you reorganise or remove them, and you can set a goal aside and welcome it back later.",
      },
      {
        title: "Milestones",
        body: "The steps inside a goal, like “run 5k without stopping”. Tick one and it’s celebrated. If it happens on a date, like race day, turn on “This happens on a date” to add the date, place, tickets and a calendar entry.",
      },
      {
        title: "Events",
        body: "Anything with a date that isn’t part of a goal: a trip, a gig, a booking. Add the date, place and links, mark it booked, show or hide the countdown, and put it in your calendar so it appears in Plan and on Today.",
      },
      {
        title: "Your journey: the training route",
        body: "Open it from Next useful action, or Your journey in the ☰ menu. You’ll see where you are and the route to your goals, week by week. Studio can plan a gradual build-up from here. If your aims change, use Change direction, and Studio drafts a new plan for you to review. You can go back to an earlier plan too.",
      },
      {
        title: "Your story and your records",
        body: "Your story collects what actually happened: filter it, and add your own moments. Under it, Your records holds your activity log and strength progress. Tap a log to fix it.",
      },
    ],
  },
  {
    title: "About me",
    summary: "What Studio knows about you, and how to keep it right.",
    art: "/assets/james-cafe-seb-v1.jpg",
    go: { label: "Open About me", target: { space: "about" } },
    topics: [
      {
        title: "Why it matters",
        body: "The better this is, the better Studio’s plans fit: your goals, body, how active you are, your equipment, your week and your energy. It saves automatically as you type.",
      },
      {
        title: "After something changes",
        body: "New injury, new job hours, new gym? Update it here, then tap Refresh my upcoming sessions so Studio rewrites them to match.",
      },
      {
        title: "Keeping up with you",
        body: "Each week Studio looks at what you’ve done and suggests updates here. You can review them, or tap Suggest updates from my progress to ask for them now.",
      },
      {
        title: "Notes for Studio",
        body: "Little things to remember, like “squats feel better with heels raised”. Tap Add a note.",
      },
      {
        title: "Starting over or looking around again",
        body: "At the bottom, Take the tour replays the short tour, and Set up from the top runs the setup conversation with Studio again.",
      },
    ],
  },
  {
    title: "Movement",
    summary: "Walks with Seb, strength, runs, recovery and your own workouts.",
    art: "/assets/james-walks-seb-v1.jpg",
    go: { label: "Open Movement", target: { space: "move" } },
    topics: [
      {
        title: "Getting moving",
        body: "In My space, open Movement. Plan with Studio builds something around you. Gentle strength, Run / walk and Recovery are ready-made ways to begin.",
      },
      {
        title: "Walk with Seb",
        body: "Tap it to note where you went and how it felt, then Save walk. There’s a timer, which only runs while the app is open and doesn’t use GPS.",
      },
      {
        title: "My workouts",
        body: "Your reusable sessions. Tap New workout, give it a name and add exercises from the list or your own. Then add it to any day.",
      },
    ],
  },
  {
    title: "Projects and people",
    summary: "Things you’re making, and the people you want to keep close.",
    art: "/assets/james-lego-v2.jpg",
    go: { label: "Open Projects", target: { space: "create" } },
    topics: [
      {
        title: "Projects",
        body: "Things you make or plan, like a LEGO build or a trip. Tap New project, then break it into steps. Reorder the steps, tick them off, and send one to a day so it lands in your plan. When it’s complete, tap Finish and celebrate.",
      },
      {
        title: "People",
        body: "In My space, open People and tap Add someone. Note what to remember about them and what you’d like to do next time. There’s no scoring here, and time with people counts however it happens.",
      },
      {
        title: "Seeing people",
        body: "Tap Plan something to put time together in your plan, or We connected today to note it after the fact.",
      },
    ],
  },
  {
    title: "Quiet things",
    summary: "Journal, breathing, the happiness jar, sleep and voice notes.",
    art: "/assets/james-movie-night-v2.jpg",
    go: { label: "Open Journal", target: { space: "reflect" } },
    topics: [
      {
        title: "Journal",
        body: "Add a title if you like, write your page, add a feeling word if one fits, then tap Save entry. Tap an old page to edit it, or swipe left to delete it.",
      },
      {
        title: "Breathe",
        body: "Choose guided breathing or quiet meditation, pick how long, and tap Begin. Afterwards you can note how you feel, and Add quiet time to Today puts it on your day.",
      },
      {
        title: "Happiness jar",
        body: "Each day, write one small good thing on Today and tap Keep it. Stuck? Tap the little idea link for a suggestion. Open the jar from My space to look back, or tap Reach into the jar for a random one.",
      },
      {
        title: "Sleep",
        body: "Lights out and Lights on build up your patterns, and in the morning you can say how you slept. Open Sleep in My space to see the last two weeks and fix or add a night you forgot.",
      },
      {
        title: "Voice notes",
        body: "For keeping a thought in your own voice. In the ☰ menu, tap Voice note. It stays a private recording, with no AI involved. You’ll find your recordings in your Journal too.",
      },
    ],
  },
  {
    title: "Money and home",
    summary: "Learning about money, and looking after ordinary life.",
    art: "/assets/money-growth.jpg",
    go: { label: "Open Investing Lab", target: { space: "money" } },
    topics: [
      {
        title: "Investing Lab",
        body: "In My space, open Money. Short daily lessons to build your understanding, each with one idea to hold onto and a question to think through. You can ask the AI learning guide anything, however basic. It’s for learning, not financial advice, so check big decisions with a qualified adviser.",
      },
      {
        title: "Home & routine",
        body: "Add routines like laundry, plants or Sunday admin. Turn on “Put it in my calendar on a repeat” and they appear in Plan and Today. Ticking one off there marks it done here too.",
      },
      {
        title: "Ten-minute reset",
        body: "When home feels like too much: clear one surface, collect what belongs elsewhere, then stop. Tap Add to Today to put it on your day.",
      },
    ],
  },
  {
    title: "Settings and getting unstuck",
    summary: "Notifications, sync, backups, and what to do when something’s off.",
    art: "/assets/james-cafe-seb-v1.jpg",
    go: { label: "Open Settings", target: { space: "preferences" } },
    topics: [
      {
        title: "Make it yours",
        body: "In My space, tap Settings, sync & backup. You can change:",
        steps: [
          "Your name.",
          "Today’s density: One focus, A few or Fuller.",
          "Sounds, and dark mode (“Evenings” goes dark from 7pm to 6am).",
          "What matters in this season: up to three areas that shape suggestions.",
        ],
      },
      {
        title: "Notifications",
        body: "Turn them on, send yourself a test, then choose which you want: your morning, pocket of happiness, lights out, before sessions, plan next week and dates coming up. You can set quiet hours, or pause for a day or a week.",
      },
      {
        title: "Phone and laptop don’t match?",
        body: "Open the ☰ menu and tap Sync now. It tells you when it last synced, or what’s wrong. Check you’re online and that the same passcode is entered on both devices.",
      },
      {
        title: "Notifications aren’t coming",
        body: "On an iPhone, open the app from its Home Screen icon, not Safari. Then check they’re on in Settings, tap Send a test, and check they aren’t paused.",
      },
      {
        title: "Studio says it needs a passcode, or that it’s wrong",
        body: "Enter it under Sync across devices in Settings. Check the spelling and capitals. If it still won’t work, ask the person who set this up for you.",
      },
      {
        title: "The plan doesn’t fit any more",
        body: "Tell Studio what changed. For a bigger shift, use Change direction in Your journey, or update About me and tap Refresh my upcoming sessions.",
      },
      {
        title: "I deleted something",
        body: "Tap Undo in the message that appears straight away. Things you chose to let go of are in Plan, under Set aside.",
      },
      {
        title: "Backups, and starting fresh",
        body: "Under Backup or start fresh, Download a backup saves a copy of everything to a file. It’s worth doing now and then. Start completely fresh clears everything on every synced device, so only use it if you’re certain.",
      },
    ],
  },
]

const matches = (topic: Topic, query: string) =>
  `${topic.title} ${topic.body} ${(topic.steps ?? []).join(" ")}`.toLowerCase().includes(query)

// The full guide: written so James can work out anything in the app with nobody there to ask.
export function Guide({ onClose, onGo }: { onClose: () => void; onGo: (target: GuideTarget) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const top = useRef<HTMLDivElement>(null)
  const query = search.trim().toLowerCase()

  const results = useMemo(
    () =>
      query
        ? CHAPTERS.flatMap((chapter, index) => chapter.topics.filter((topic) => matches(topic, query)).map((topic) => ({ topic, chapter, index })))
        : [],
    [query],
  )

  useEffect(() => {
    top.current?.scrollIntoView({ block: "start" })
  }, [open])

  const chapter = open === null ? null : CHAPTERS[open]

  return (
    <Modal title="How everything works" eyebrow="The full guide" onClose={onClose} wide>
      <div className="guide" ref={top}>
        {chapter && open !== null ? (
          <>
            <button type="button" className="text-link guide__back" onClick={() => setOpen(null)}>
              <ArrowLeft size={16} /> All chapters
            </button>
            <Art className="guide__art" src={chapter.art} />
            <p className="eyebrow">
              Chapter {open + 1} of {CHAPTERS.length}
            </p>
            <h2>{chapter.title}</h2>
            <p className="guide__summary">{chapter.summary}</p>
            <div className="guide__topics">
              {chapter.topics.map((topic) => (
                <TopicCard topic={topic} key={topic.title} />
              ))}
            </div>
            <div className="guide__actions">
              {chapter.go && (
                <Button variant="secondary" onClick={() => onGo(chapter.go!.target)}>
                  {chapter.go.label}
                </Button>
              )}
              {open < CHAPTERS.length - 1 ? (
                <Button icon={ArrowRight} onClick={() => setOpen(open + 1)}>
                  Next: {CHAPTERS[open + 1].title}
                </Button>
              ) : (
                <Button onClick={onClose}>Finish the guide</Button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="guide__intro">
              Everything the app can do, explained from the beginning. Read it in order, or search for what you need and come back whenever you’re stuck. It’s always in the ☰ menu and in My space.
            </p>
            <label className="guide__search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search, like “notifications” or “delete”"
                aria-label="Search the guide"
              />
            </label>
            {query ? (
              results.length ? (
                <div className="guide__topics">
                  {results.map(({ topic, chapter: from, index }) => (
                    <TopicCard topic={topic} from={from.title} onOpenChapter={() => setOpen(index)} key={`${from.title}-${topic.title}`} />
                  ))}
                </div>
              ) : (
                <p className="guide__empty">Nothing matches that. Try another word, or ask Studio.</p>
              )
            ) : (
              <>
                <Button icon={ArrowRight} onClick={() => setOpen(0)}>
                  Start from the beginning
                </Button>
                <ol className="guide__chapters">
                  {CHAPTERS.map((item, index) => (
                    <li key={item.title}>
                      <button type="button" onClick={() => setOpen(index)}>
                        <span className="guide__number">{index + 1}</span>
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.summary}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

function TopicCard({ topic, from, onOpenChapter }: { topic: Topic; from?: string; onOpenChapter?: () => void }) {
  return (
    <article className="guide__topic">
      {from && (
        <button type="button" className="eyebrow guide__from" onClick={onOpenChapter}>
          {from}
        </button>
      )}
      <h3>{topic.title}</h3>
      <p>{topic.body}</p>
      {topic.steps && (
        <ul>
          {topic.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
