# 🚀 RapidAPI APIs Collection

5 free APIs hosted on Cloudflare Workers, available on [RapidAPI](https://rapidapi.com/user/CowanNath).

## 📦 APIs

### 1. 🌤️ QuickWeather API
Real-time weather data for any location worldwide.

- [**Try on RapidAPI →**](#) (链接上架后替换)
- Live URL: `https://quickweather-api.a737620843.workers.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/current` | GET | Get current weather by city name or coordinates |
| `/forecast` | GET | Get multi-day weather forecast (up to 16 days) |
| `/search` | GET | Search cities worldwide with population data |

**Example:**
```bash
# Current weather
curl "https://quickweather-api.a737620843.workers.dev/current?city=Beijing"

# 7-day forecast
curl "https://quickweather-api.a737620843.workers.dev/forecast?city=Shanghai&days=7"

# Search city
curl "https://quickweather-api.a737620843.workers.dev/search?q=London"
```

---

### 2. 📰 FinanceNews API
Latest financial and business news from multiple sources.

- [**Try on RapidAPI →**](#)
- Live URL: `https://financenews-api.a737620843.workers.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/latest` | GET | Latest financial news (CNBC, MarketWatch, CoinDesk) |
| `/search` | GET | Search news by keyword |
| `/markets` | GET | Major currency exchange rates overview |
| `/crypto` | GET | Latest cryptocurrency news |
| `/sources` | GET | List available news sources |

**Example:**
```bash
# Latest news
curl "https://financenews-api.a737620843.workers.dev/latest?limit=5"

# Search news
curl "https://financenews-api.a737620843.workers.dev/search?q=bitcoin&limit=5"

# Market overview
curl "https://financenews-api.a737620843.workers.dev/markets"
```

---

### 3. 📱 QRCodeGen API
Generate QR codes and Code128 barcodes instantly.

- [**Try on RapidAPI →**](#)
- Live URL: `https://qrcodegen-api.a737620843.workers.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/qrcode` | GET | Generate QR code (PNG / base64 / URL) |
| `/barcode` | GET | Generate Code128 barcode |

**Example:**
```bash
# QR code image
curl "https://qrcodegen-api.a737620843.workers.dev/qrcode?text=https://example.com&format=png"

# QR code as base64
curl "https://qrcodegen-api.a737620843.workers.dev/qrcode?text=Hello&format=base64"

# Barcode
curl "https://qrcodegen-api.a737620843.workers.dev/barcode?text=1234567890&format=png"
```

---

### 4. 🌐 FastTranslate API
Fast translation for 100+ languages.

- [**Try on RapidAPI →**](#)
- Live URL: `https://fasttranslate-api.a737620843.workers.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/translate` | GET/POST | Translate text (supports language codes and full names) |
| `/languages` | GET | List all supported languages |
| `/detect` | GET | Detect the language of any text |

**Example:**
```bash
# Translate by language code
curl "https://fasttranslate-api.a737620843.workers.dev/translate?text=Hello&to=zh"

# Translate by language name
curl "https://fasttranslate-api.a737620843.workers.dev/translate?text=Hello&to=chinese"

# Detect language
curl "https://fasttranslate-api.a737620843.workers.dev/detect?text=你好世界"

# List languages
curl "https://fasttranslate-api.a737620843.workers.dev/languages"
```

---

### 5. 💱 LiveExchange API
Real-time currency exchange rates for 150+ currencies.

- [**Try on RapidAPI →**](#)
- Live URL: `https://liveexchange-api.a737620843.workers.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rates` | GET | All exchange rates for a base currency |
| `/convert` | GET | Convert amount between two currencies |
| `/pair` | GET | Get rate for a specific currency pair |
| `/currencies` | GET | List all supported currencies |

**Example:**
```bash
# Get all USD rates
curl "https://liveexchange-api.a737620843.workers.dev/rates?base=USD"

# Convert currency
curl "https://liveexchange-api.a737620843.workers.dev/convert?from=USD&to=CNY&amount=100"

# Get pair rate
curl "https://liveexchange-api.a737620843.workers.dev/pair?from=EUR&to=USD"
```

---

## ⚙️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Cloudflare Workers |
| Language | JavaScript (ES Modules) |
| Data Sources | Open-Meteo, MyMemory, ExchangeRate-API, RSS Feeds |
| Hosting | Cloudflare Workers (Free Tier) |
| Code | [GitHub](https://github.com/CowanNath/rapidapi-apis) |

## 📄 License

MIT
