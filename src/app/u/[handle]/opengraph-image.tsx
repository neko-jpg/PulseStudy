import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Public Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { handle: string } }) {
  const handle = params.handle
  // In real app, fetch summary
  const name = 'Teppei'
  const mins = 124
  const acc = 74
  const streak = 7
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: 'linear-gradient(135deg,#8B9EFF,#E0A96F)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          color: '#111',
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.8 }}>PulseStudy</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>{name} <span style={{ fontSize: 36, opacity: 0.8 }}>@{handle}</span></div>
        <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
          <div>合計 {mins}分</div>
          <div>正答 {acc}%</div>
          <div>連続 {streak}日</div>
        </div>
      </div>
    ),
    { ...size }
  )
}

