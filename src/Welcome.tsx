import { ArrowLeft, ArrowRight, Check, Copy, Download, Ellipsis, EllipsisVertical, KeyRound, Laptop, Share, SquarePlus } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { isStandalone } from "./notifications"
import { getPasscode, pullState, setPasscode, SyncError } from "./sync"
import { Art, Button } from "./ui"

// The first few minutes on a new phone, for someone setting up alone: what this is, putting it on the
// Home Screen (first, because on iPhone the Home Screen app keeps its own separate storage), the
// passcode, then Studio's setup conversation.
const WELCOME_KEY = "life-studio:welcome"

export const welcomeDone = () => {
  try {
    return localStorage.getItem(WELCOME_KEY) === "done"
  } catch {
    return false
  }
}

const markDone = () => {
  try {
    localStorage.setItem(WELCOME_KEY, "done")
  } catch {
    // Private browsing: the welcome shows again next visit, which is fine.
  }
}

type Device = "ios-safari" | "ios-other" | "in-app" | "android" | "computer"

const deviceOf = (): Device => {
  const agent = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
  if (/FBAN|FBAV|Instagram|WhatsApp|Snapchat|TikTok|LinkedInApp|Line\/|GSA\//.test(agent)) return "in-app"
  if (ios) return /CriOS|FxiOS|EdgiOS/.test(agent) ? "ios-other" : "ios-safari"
  if (/Android/.test(agent)) return "android"
  return "computer"
}

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

function Steps({ items }: { items: { icon?: ReactNode; text: ReactNode }[] }) {
  return (
    <ol className="welcome__steps">
      {items.map((item, index) => (
        <li key={index}>
          <span className="welcome__number">{index + 1}</span>
          <span className="welcome__step-text">{item.text}</span>
          {item.icon && <span className="welcome__step-icon">{item.icon}</span>}
        </li>
      ))}
    </ol>
  )
}

function CopyLink() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="welcome__link"
      onClick={() =>
        navigator.clipboard?.writeText(window.location.origin).then(
          () => setCopied(true),
          () => setCopied(false),
        )
      }
    >
      <span>{window.location.host}</span>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      <small>{copied ? "Copied" : "Copy link"}</small>
    </button>
  )
}

function InstallStep({ next }: { next: () => void }) {
  const device = deviceOf()
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
    }
    const done = () => setInstalled(true)
    window.addEventListener("beforeinstallprompt", capture)
    window.addEventListener("appinstalled", done)
    return () => {
      window.removeEventListener("beforeinstallprompt", capture)
      window.removeEventListener("appinstalled", done)
    }
  }, [])

  if (device === "computer")
    return (
      <>
        <h1>It’s made for your phone</h1>
        <p>Life Studio works on a computer too, but it’s happiest on your phone, where it can sit on your Home Screen and give you gentle reminders.</p>
        <Steps
          items={[
            { text: "Open this link on your phone (copy it, or type it into Safari or Chrome):" },
            { text: "Follow the steps there to add it to your Home Screen." },
          ]}
        />
        <CopyLink />
        <div className="welcome__actions">
          <Button icon={Laptop} variant="secondary" onClick={next}>
            Carry on here instead
          </Button>
        </div>
      </>
    )

  if (device === "in-app")
    return (
      <>
        <h1>Open this in Safari first</h1>
        <p>You’ve opened the link inside another app, like WhatsApp or Instagram. Those can’t add things to your Home Screen.</p>
        <Steps
          items={[
            { text: <>Tap <strong>⋯</strong> or the compass icon (usually top or bottom right)</>, icon: <Ellipsis size={18} /> },
            { text: <>Choose <strong>Open in Safari</strong> (or Open in browser)</> },
            { text: "Then follow the steps you see there." },
          ]}
        />
        <p className="welcome__small">Or copy the link and paste it into Safari:</p>
        <CopyLink />
      </>
    )

  if (device === "android")
    return (
      <>
        <h1>Put it on your Home Screen</h1>
        <p>Then it opens like a normal app, full screen, and can send you the odd gentle reminder.</p>
        {prompt && !installed ? (
          <div className="welcome__actions">
            <Button
              icon={Download}
              onClick={async () => {
                await prompt.prompt()
                const choice = await prompt.userChoice
                if (choice.outcome === "accepted") setInstalled(true)
                setPrompt(null)
              }}
            >
              Add to Home Screen
            </Button>
          </div>
        ) : installed ? (
          <p className="welcome__good">
            <Check size={18} /> Added. Open Life Studio from its new icon, and you’ll carry on from here.
          </p>
        ) : (
          <Steps
            items={[
              { text: <>Tap the <strong>⋮</strong> menu at the top right of Chrome</>, icon: <EllipsisVertical size={18} /> },
              { text: <>Tap <strong>Add to Home screen</strong> (or <strong>Install app</strong>)</> },
              { text: <>Tap <strong>Install</strong>, then open Life Studio from its new icon</> },
            ]}
          />
        )}
      </>
    )

  return (
    <>
      <h1>First, put it on your Home Screen</h1>
      <p>It then opens like a normal app, full screen, and it’s the only way an iPhone lets it send you gentle reminders.</p>
      <Steps
        items={
          device === "ios-safari"
            ? [
                { text: <>Tap the <strong>Share</strong> button. It’s at the bottom of Safari (if you can’t see it, tap <strong>⋯</strong> first)</>, icon: <Share size={18} /> },
                { text: <>Scroll down a little and tap <strong>Add to Home Screen</strong></>, icon: <SquarePlus size={18} /> },
                { text: <>Tap <strong>Add</strong> at the top right</> },
                { text: <>Close Safari and open <strong>Life Studio</strong> from your Home Screen. You’ll carry on from there.</> },
              ]
            : [
                { text: <>Tap the <strong>Share</strong> button (top right, next to the address bar)</>, icon: <Share size={18} /> },
                { text: <>Tap <strong>Add to Home Screen</strong></>, icon: <SquarePlus size={18} /> },
                { text: <>Tap <strong>Add</strong>, then open <strong>Life Studio</strong> from your Home Screen</> },
              ]
        }
      />
      <p className="welcome__small">Do this before setting up: on iPhone, the Home Screen app starts fresh and doesn’t see what you did in the browser.</p>
    </>
  )
}

function PasscodeStep({ next }: { next: () => void }) {
  const [value, setValue] = useState(getPasscode())
  const [state, setState] = useState<"idle" | "checking" | "good" | "wrong" | "unknown">("idle")
  const [found, setFound] = useState(false)

  const check = async () => {
    const passcode = value.trim()
    if (!passcode) return
    setState("checking")
    setPasscode(passcode)
    try {
      const remote = await pullState()
      setFound(!!remote.state?.onboarded)
      setState("good")
    } catch (failure) {
      if (failure instanceof SyncError && failure.status === 401) {
        setPasscode("")
        setState("wrong")
      } else setState("unknown")
    }
  }

  return (
    <>
      <h1>Your passcode</h1>
      <p>You should have been given a passcode with this app (it looks like <em>word-word-word-12</em>). It lets Studio think for you and keeps your space safe on all your devices.</p>
      <form
        className="welcome__passcode"
        onSubmit={(event) => {
          event.preventDefault()
          check()
        }}
      >
        <label>
          <span>
            <KeyRound size={16} /> Passcode
          </span>
          <input
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setState("idle")
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
            placeholder="e.g. maple-otter-acorn-12"
          />
        </label>
        <Button type="submit" disabled={!value.trim() || state === "checking"}>
          {state === "checking" ? "Checking…" : "Check it"}
        </Button>
      </form>
      {state === "good" && (
        <p className="welcome__good">
          <Check size={18} /> {found ? "That’s the one, and your space is already here. Bringing it across…" : "That’s the one. You’re all set."}
        </p>
      )}
      {state === "wrong" && <p className="welcome__bad">That doesn’t match. Check for typos: it’s all lowercase, with dashes between the words.</p>}
      {state === "unknown" && <p className="welcome__small">Couldn’t check it right now (are you online?). It’s saved, and Studio will try again later.</p>}
      <div className="welcome__actions">
        {state === "good" || state === "unknown" ? (
          <Button icon={ArrowRight} onClick={next}>
            {found ? "Open my space" : "Next: meet Studio"}
          </Button>
        ) : (
          <button type="button" className="text-link" onClick={next}>
            I don’t have it yet, skip for now
          </button>
        )}
      </div>
      {state !== "good" && state !== "unknown" && (
        <p className="welcome__small">Without it the app still works on this phone; Studio just gives simpler suggestions. You can add it any time in My space → Settings.</p>
      )}
    </>
  )
}

const ART = ["/assets/james-reading-v1.jpg", "/assets/james-walks-seb-v1.jpg", "/assets/james-cafe-seb-v1.jpg"]

// Shown before setup on each new device. `onDone(hasPasscode)` lets the app load any space that's
// already set up (e.g. started in the browser, now on the Home Screen).
export function Welcome({ onDone }: { onDone: (hasPasscode: boolean) => void }) {
  const standalone = isStandalone()
  const steps = ["hello", ...(standalone ? [] : ["install"]), "passcode"] as const
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const next = () => setIndex((value) => Math.min(value + 1, steps.length - 1))
  const body = useRef<HTMLDivElement>(null)
  // Each step starts at its heading (for screen readers too), so the tapped button vanishing doesn't strand focus.
  useEffect(() => {
    if (index === 0) return
    const heading = body.current?.querySelector("h1")
    heading?.setAttribute("tabindex", "-1")
    heading?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [index])
  const finish = () => {
    markDone()
    onDone(!!getPasscode())
  }

  return (
    <main className="welcome">
      <div className="welcome__card">
        <Art key={index} className="welcome__art" src={ART[Math.min(index, ART.length - 1)]} />
        <div className="welcome__body" ref={body}>
          <p className="eyebrow">
            Step {index + 1} of {steps.length + 1}
          </p>
          {step === "hello" && (
            <>
              <h1>Hello, and welcome</h1>
              <p>
                This is <strong>Life Studio</strong>, made for you: a calm place for your days, plans, movement, projects, people and sleep, with a
                helper called <strong>Studio</strong> that you can just talk to.
              </p>
              <ul className="welcome__promises">
                <li>Setting up takes about five minutes.</li>
                <li>You can’t break anything. Everything can be changed or undone later.</li>
                <li>Plans here are plans, not promises. Skipping or moving things is always fine.</li>
              </ul>
              <div className="welcome__actions">
                <Button icon={ArrowRight} onClick={next}>
                  Let’s start
                </Button>
              </div>
            </>
          )}
          {step === "install" && (
            <>
              <InstallStep next={next} />
              {deviceOf() !== "computer" && (
                <div className="welcome__actions">
                  <button type="button" className="text-link" onClick={next}>
                    I’ll do this later, carry on
                  </button>
                </div>
              )}
            </>
          )}
          {step === "passcode" && <PasscodeStep next={finish} />}
          {index > 0 && (
            <button type="button" className="text-link welcome__back" onClick={() => setIndex(index - 1)}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
