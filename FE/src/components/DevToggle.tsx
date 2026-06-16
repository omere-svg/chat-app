export function DevToggle({
  simulateSendFailure,
  onSimulateSendFailureChange,
}: {
  simulateSendFailure: boolean
  onSimulateSendFailureChange: (enabled: boolean) => void
}): React.ReactElement {
  return (
    <label className="dev-toggle">
      <input
        type="checkbox"
        checked={simulateSendFailure}
        onChange={(event) => onSimulateSendFailureChange(event.target.checked)}
      />
      Simulate send failure
    </label>
  )
}
