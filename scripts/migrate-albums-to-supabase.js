// Script de migração: lê álbuns do localStorage e sobe para o Supabase
// Execute: node scripts/migrate-albums-to-supabase.js

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

const SUPABASE_URL = 'https://bvlybqzlkwibimqzdeyz.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_M8jz5CrPQkBFXV5Vq0qySA_ypPVlWZT'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

console.log('\n==============================================')
console.log('  Xeque Mate — Migrador de Álbuns para Supabase')
console.log('==============================================\n')
console.log('Cole abaixo o conteúdo de xm_albums do localStorage.')
console.log('(No PC: DevTools → Application → localStorage → xm_albums → copiar o valor)')
console.log('Pressione Enter duas vezes em seguida para confirmar.\n')

let input = ''
rl.on('line', (line) => { input += line })
rl.on('close', async () => {
  if (!input.trim()) {
    console.log('Nenhum dado fornecido. Saindo.')
    process.exit(0)
  }

  let albums
  try {
    albums = JSON.parse(input.trim())
    if (!Array.isArray(albums)) {
      console.error('Erro: esperava um array de álbuns.')
      process.exit(1)
    }
  } catch (e) {
    console.error('Erro ao parsear JSON:', e.message)
    process.exit(1)
  }

  console.log(`\nEncontrados ${albums.length} álbum(ns) para migrar...\n`)

  for (const album of albums) {
    const row = {
      id: album.id,
      title: album.title,
      artist_name: album.artistName,
      year: album.year || '',
      cover_url: album.coverUrl || null,
      tracks: album.tracks || [],
      created_at: album.createdAt || new Date().toISOString(),
      updated_at: album.updatedAt || new Date().toISOString(),
    }

    const { error } = await supabase
      .from('albums')
      .upsert(row, { onConflict: 'id' })

    if (error) {
      console.error(`❌ Erro ao migrar "${album.title}":`, error.message)
    } else {
      console.log(`✅ "${album.title}" migrado com sucesso!`)
    }
  }

  console.log('\n✅ Migração concluída! Álbuns disponíveis em todos os dispositivos.')
  process.exit(0)
})
