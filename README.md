# Zeyayaya

Situs perkenalan identitas VTuber **Zeya Haize** (kanal **Zeyayaya**). Dibangun
dari template keluarga yang sama dengan Mizu, Pingu, Sierra, Deidey, Kanata, dan
Lunie, tapi tema dan datanya milik Zeya sendiri.

## Yang terverifikasi

Tidak ada satu pun string di halaman ini yang tidak bisa ditelusuri ke sumbernya.

| | Sumber |
|---|---|
| Nama, bio | Deskripsi kanal YouTube + nama tampilan X |
| Avatar | `yt3.googleusercontent.com`, avatar kanal |
| Tanggal gabung | `/about` kanal — **12 Desember 2021** |
| Kredit karakter | Bio X-nya sendiri: *"ママ: @Ikazu401 | パパ： @re_reinly"* |
| Kanal | Empat tautan di blok JSON-LD `sameAs` kanal, plus kanalnya sendiri |
| Hashtag | Bio X ("🎨Art: #haizeyart") dan post merch-nya sendiri |
| Series | Dibaca dari prefiks bracket judul feed |

Deskripsi kanalnya, persis:
> ✧˚· Welcome home, your dream keeper here! ·˚✧ Hai, aku Zeya Haize. Penjaga mimpimu agar tidurmu nyenyak. HAIZEYAYAYA!!!~ ☁💤 Let's be my "Dream Dwellers" in "Pond of Dream"!

Karena deskripsi itulah yang menamai komunitasnya, "Dream Dwellers" di "Pond of
Dream" di halaman ini adalah kata dia sendiri, bukan istilah yang direkayasa.
Kredit karakter juga diambil apa adanya: "Mama" dan "Papa" adalah istilah
komunitas untuk ilustrator dan rigger karakter, dan dipertahankan persis
seperti dia menulisnya di bio.

### Hashtag

Dua tag, dan masing-masing bersumber ke tempat dia menulisnya:

```
Art:   #haizeyart    -- bio X-nya, dia yang memberi label "🎨Art"
Merch: #merchaizeya  -- post-nya sendiri yang meminta pembeli
                        memfoto dan posting dengan tag itu
```

`#haizeyart` juga menggerakkan `/fanart`, jadi route itu mencari tag yang memang
dia tandai untuk keperluan itu, bukan tag komunitas yang dipinjam.

Tag event dari timeline yang sama (#CF23Catalogue, #comifuro23) sengaja tidak
ditampilkan: tag itu menamai booth convention, bukan dia, dan pencariannya
mengembalikan setiap penjual di booth tersebut.

## Palet

```
base / midtone ......... #A3C7EE   biru es/langit lembut, warna yang dominan
                                   di rambutnya
shadow ................ #5B86B7   biru medium muted untuk lekuk dan bayangan
                                   rambut
highlight / glow ...... #FFD65C   emas bercahaya di mata berkilau dan
                                   perhiasannya
```

Hitungan kontras diukur, bukan dikira-kira. Dua konsekuensi brief tercatat di
`src/index.css` supaya tidak "diperbaiki" tanpa sengaja:

- **Shadow `#5B86B7` adalah mid-tone** — 3.6:1 di ground terang, layak untuk
  batas dan fill, tapi tidak bisa membawa teks kecil. Versi teksnya adalah
  step yang lebih gelap (`--shadow-ink`, 7.6:1 di fill chip).
- **Highlight `#FFD65C` hanya terbaca sebagai teks di ground gelap** (12.5:1).
  Di light dia jadi glow badge, bel notifikasi, dan wash, sementara `--accent`
  memakai step base yang diperdalam.

## Tipografi

- **Quicksand** untuk display — ujung huruf yang membulat dan lebar membuat
  heading terbaca lunak, sesuai tema penjaga mimpi di bawah awan.
- **Hanken Grotesk** untuk body — grotesk netral yang tidak bersaing dengan
  display face. Teks dibaca, heading dipandangi.

Keduanya dipasang sebagai variable font; build hanya menarik dua berkas
woff2 per subset.

## Stack

- Vite + React + TypeScript
- Tailwind v4 (token warna di `src/index.css`)
- Vercel Serverless Functions di `api/` — `content`, `viewers`, `chat`,
  `tweets`, `fanart`
- Data diambil real-time dari YouTube dan X, dengan snapshot fallback

## Menjalankan

```bash
npm install
npm run dev     # tidak menyajikan /api/* (itu serverless)
npm run build   # tsc -b && vite build
npm run lint
```

Deploy: import repo ini di Vercel. Build command `npm run build`, output
`dist`, folder `api/` terbaca sebagai Node functions.

## Credits

- **Developed by Sakamura**
- Gambar dan video milik [Zeyayaya](https://www.youtube.com/@ZeyaHaize)
- Fan art di `/fanart` milik kreatornya masing-masing