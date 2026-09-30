
const names = ['dsh-attach-picker','dsh-image-picker','dsh-upload-button']
for (const n of names) {
  try {
    const r = await fetch('https://registry.npmjs.org/' + encodeURIComponent(n), { method: 'GET' })
    console.log(n, '->', r.status === 404 ? 'AVAILABLE' : 'status ' + r.status)
  } catch (e) { console.log(n, '-> network error:', e.message) }
}
try {
  const r = await fetch('https://awesome-dsh-plugin.com/plugins.json')
  const j = await r.json()
  const list = Array.isArray(j) ? j : (j.plugins ?? [])
  console.log('registry entries:', list.length)
  console.log('sample entry:', JSON.stringify(list[0], null, 2).slice(0, 900))
} catch (e) { console.log('registry error:', e.message) }
