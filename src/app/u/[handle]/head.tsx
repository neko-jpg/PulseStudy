export default function Head({ params }: { params: { handle: string } }) {
  const url = `/u/${params.handle}/opengraph-image`
  return (
    <>
      <title>@{params.handle} | PulseStudy</title>
      <meta property="og:image" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={url} />
    </>
  )
}

