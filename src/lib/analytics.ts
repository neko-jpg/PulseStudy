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

