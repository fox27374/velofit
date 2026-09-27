import { InfoPanel } from './InfoPanel'

interface InfoButtonProps {
  ariaLabel: string
  note: string
  evidence: 'Sourced' | 'Weak' | 'No source'
  anchor?: string
}

export function InfoButton(props: InfoButtonProps) {
  return <InfoPanel {...props} />
}
