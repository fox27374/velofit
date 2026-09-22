import { useState } from 'preact/hooks'
import { BuyFit } from './buyfit/BuyFit'

type Screen = 'home' | 'fit' | 'howto' | 'tables' | 'buyfit'

const entries: { screen: Screen; title: string; blurb: string; state?: string }[] = [
  {
    screen: 'buyfit',
    title: 'BuyFit',
    blurb:
      'Three body measurements, and the bikes whose published geometry fits them. For buying a frame you do not own yet.',
  },
  {
    screen: 'fit',
    title: 'Bike Fitting',
    blurb:
      'Film yourself pedaling on a trainer and measure your joint angles against target ranges.',
    state: 'not built yet',
  },
  {
    screen: 'howto',
    title: 'How to Measure',
    blurb: 'Camera setup, lighting and the recording sequence that make the numbers worth having.',
    state: 'not built yet',
  },
  {
    screen: 'tables',
    title: 'Fitting Tables',
    blurb: 'Every target range in the app, with the study or the fitter it came from.',
    state: 'not built yet',
  },
]

function Home({ go }: { go: (s: Screen) => void }) {
  return (
    <>
      <div class="home-mark">
        <h1>velofit</h1>
        <span>bike fitting, measured</span>
      </div>
      <p class="home-lede">
        Measurements stay in the browser and are never sent anywhere. The app fetches a public geometry table from an API. Every number says how well it is sourced — including
        the ones the evidence does not support.
      </p>
      <nav class="home-nav">
        {entries.map((e) => (
          <button key={e.screen} class="home-entry" onClick={() => go(e.screen)}>
            <strong>{e.title}</strong>
            {e.state && <em>{e.state}</em>}
            <p>{e.blurb}</p>
          </button>
        ))}
      </nav>
    </>
  )
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'home') return <Home go={setScreen} />
  if (screen === 'buyfit') return <BuyFit onHome={() => setScreen('home')} />

  const title = entries.find((e) => e.screen === screen)!.title
  return (
    <>
      <button class="buyfit-back" onClick={() => setScreen('home')}>
        &larr; Home
      </button>
      <h1>{title}</h1>
      <p class="buyfit-help">Not built yet.</p>
    </>
  )
}
