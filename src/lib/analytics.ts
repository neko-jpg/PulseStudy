type EventPayload = {
  name: string
  props?: Record<string, any>
}

export async function track(event: EventPayload) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        ts: Date.now(),
        page: typeof window !== 'undefined' ? location.pathname : undefined,
      }),
    })
  } catch (e) {
    // noop
  }
}

// Helpers: enforce common props for learning context
export function trackStepView(moduleId: string, idx: number, step: 'explain'|'quiz'|'result') {
  return track({ name: 'module_step_view', props: { moduleId, idx, step } })
}

export function trackSubmit(moduleId: string, idx: number, correct: boolean) {
  return track({ name: 'quiz_submit', props: { moduleId, idx, correct } })
}

export function trackFlow(moduleId: string, idx: number, state: 'bored'|'confused'|'focused') {
  return track({ name: `suggest_stop_${state}` as const, props: { moduleId, idx } })
}
