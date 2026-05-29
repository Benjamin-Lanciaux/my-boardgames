export interface BggSearchResult {
  bgg_id: number
  name: string
  year: number | null
}

export interface BggGameDetail extends BggSearchResult {
  image_url: string | null
  thumbnail_url: string | null
  min_players: number | null
  max_players: number | null
  playing_time: number | null
}

function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'text/xml')
}

function val(el: Element, tag: string): string | null {
  return el.querySelector(tag)?.getAttribute('value') ?? null
}

const BGG_PROXY = 'https://ozpepshmkcjpvuyorqtm.supabase.co/functions/v1/bgg-proxy'

export async function searchBgg(query: string): Promise<BggSearchResult[]> {
  const res = await fetch(`${BGG_PROXY}?path=/search&query=${encodeURIComponent(query)}&type=boardgame`)
  const doc = parseXml(await res.text())
  return Array.from(doc.querySelectorAll('item'))
    .slice(0, 20)
    .map(item => ({
      bgg_id: parseInt(item.getAttribute('id') ?? '0'),
      name: item.querySelector('name[type="primary"]')?.getAttribute('value') ?? '(sans titre)',
      year: val(item, 'yearpublished') ? parseInt(val(item, 'yearpublished')!) : null,
    }))
    .filter(g => g.bgg_id > 0)
}

export async function fetchBggDetail(bgg_id: number): Promise<BggGameDetail | null> {
  const res = await fetch(`${BGG_PROXY}?path=/thing&id=${bgg_id}&type=boardgame`)
  const doc = parseXml(await res.text())
  const item = doc.querySelector('item')
  if (!item) return null
  return {
    bgg_id,
    name: item.querySelector('name[type="primary"]')?.getAttribute('value') ?? '',
    year: val(item, 'yearpublished') ? parseInt(val(item, 'yearpublished')!) : null,
    image_url: item.querySelector('image')?.textContent?.trim() ?? null,
    thumbnail_url: item.querySelector('thumbnail')?.textContent?.trim() ?? null,
    min_players: val(item, 'minplayers') ? parseInt(val(item, 'minplayers')!) : null,
    max_players: val(item, 'maxplayers') ? parseInt(val(item, 'maxplayers')!) : null,
    playing_time: val(item, 'playingtime') ? parseInt(val(item, 'playingtime')!) : null,
  }
}
