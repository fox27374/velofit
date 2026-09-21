import { useState } from 'preact/hooks'
import { BuyFit } from './buyfit/BuyFit'

type Screen = 'home' | 'fit' | 'howto' | 'tables' | 'buyfit'

const entries: { screen: Screen; title: string; blurb: string }[] = [
  {
    screen: 'fit',
    title: 'Bike Fitting',
    blurb: 'Film yourself pedaling and measure your position.',
  },
  {
    screen: 'howto',
    title: 'How to Measure',
    blurb: 'Camera setup, lighting and the recording sequence.',
  },
  {
    screen: 'tables',
    title: 'Fitting Tables',
    blurb: 'The target ranges, and what each one is sourced from.',
  },
  {
    screen: 'buyfit',
    title: 'BuyFit',
    blurb: 'Measure your body, narrow down which frame to buy.',
  },
]

function Home({ go }: { go: (s: Screen) => void }) {
  return (
    <>
      <h1>velofit</h1>
      <nav>
        {entries.map((e) => (
          <button key={e.screen} onClick={() => go(e.screen)}>
            <strong>{e.title}</strong>
            <span>{e.blurb}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'home') return <Home go={setScreen} />
  if (screen === 'buyfit') return <BuyFit />

  const title = entries.find((e) => e.screen === screen)!.title
  return (
    <>
      <button onClick={() => setScreen('home')}>&larr; Back</button>
      <h1>{title}</h1>
      <p>Not built yet.</p>
    </>
  )
}
