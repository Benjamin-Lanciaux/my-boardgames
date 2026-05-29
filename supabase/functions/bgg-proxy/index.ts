const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const url = new URL(req.url)
  const path = url.searchParams.get('path') ?? ''
  url.searchParams.delete('path')

  const bggUrl = `https://boardgamegeek.com/xmlapi2${path}?${url.searchParams}`

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(bggUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*',
        'Referer': 'https://boardgamegeek.com/',
        'Origin': 'https://boardgamegeek.com',
      },
    })

    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 2000))
      continue
    }

    const body = await res.text()
    return new Response(body, {
      headers: { ...CORS, 'Content-Type': 'application/xml' },
      status: res.status,
    })
  }

  return new Response('<error>BGG timeout</error>', {
    headers: { ...CORS, 'Content-Type': 'application/xml' },
    status: 504,
  })
})
