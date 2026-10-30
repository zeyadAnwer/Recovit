# Launch checklist

Run `pnpm launch:check` for the live list of placeholders. Everything below
must be confirmed before pointing **recovik.com** at the site.

## Business data — `src/config/site.config.ts`

- [ ] `legalName` — registered company name (`[LEGAL_NAME]`)
- [ ] `phones.emergency` — the 24/7 incident line. Until filled, the header button reads "Incident? Start a case" and links to the case form; the emergency banner stays hidden (`[PHONE_EMERGENCY]`)
- [ ] `phones.main` (`[PHONE_MAIN]`)
- [ ] `whatsapp` — the floating button and menu action appear once filled (`[WHATSAPP_NUMBER]`)
- [ ] `address.ar` / `address.en`, `mapUrl`, `countryCode`
- [ ] `hours.ar` / `hours.en`
- [ ] `responseTime.ar` / `.en` — shown in the hero trust row only when filled, e.g. "Response within 1 hour" (`[RESPONSE_TIME_AR]`, `[RESPONSE_TIME_EN]`)
- [ ] `stats` — real, provable figures only; placeholders keep them hidden. `successRate` = share of ransomware cases fully or largely restored (`[SUCCESS_RATE]`)
- [ ] `social` — profile URLs (empty ones stay hidden)
- [ ] Mailboxes `info@`, `support@`, `sales@`, `security@recovik.com`

## Content placeholders

- [ ] About: company story (`[ABOUT_STORY]`) and team (`[ABOUT_TEAM]`)
- [ ] Photo: `[PHOTO: incident response team at work]` (About page)
- [ ] Legal pages reviewed by a lawyer; fill `[LEGAL_NAME]`, `[COMPANY_REGISTRATION]`, `[JURISDICTION]`, `[RETENTION_PERIOD]`

## Claims the copy makes — confirm each is true

### Ransomware recovery

- [ ] **Decryption is pursued first**, using known decryptors and our own analysis of the strain
- [ ] **If decryption is not possible, our own tools reconstruct files and databases**, with integrity checks on every item
- [ ] **Outcome as stated:** "your database and files restored correctly and reliably — complete, or with only a small portion missing" (ransomware page, What you get)
- [ ] We advise on the ransom decision and on reporting to the authorities
- [ ] We do not pay ransoms or negotiate with attackers without the client's written instruction and legal clearance (Terms)
- [ ] We identify the strain and how the attackers got in

### Service and response

- [ ] Incident line answered **24/7** (emergency banner, footer "Answered 24/7", urgency hint "We call you straight away, day or night")
- [ ] Round-the-clock work during major incidents (Companies sector)
- [ ] **Written investigation report** with an attack timeline (hero trust row, commitments, forensics)
- [ ] **Confidential by default; NDA on request**; only analysts on the case see the data (hero, commitments, terms)
- [ ] **Evidence preserved** — work on copies with a documented chain of custody
- [ ] **Price agreed before recovery work starts**; advice on the first call costs nothing (process page, terms)
- [ ] A named incident lead stays with the client from first call to final report (About)
- [ ] Copies are returned or securely deleted after the case, confirmed in writing (FAQ, privacy)
- [ ] We do not disclose clients or incidents (FAQ)
- [ ] Mostly remote work; on-site work can be arranged when data cannot leave the premises (FAQ)
- [ ] We can work without an in-house IT team (FAQ)
- [ ] We do **not** repair physically damaged hardware (FAQ, About)
- [ ] Contact-form messages answered within **one working day** (receipt message)
- [ ] An analyst answers the incident line (FAQ lead, contact page title)
- [ ] Databases supported: SQL Server, MySQL, MariaDB, PostgreSQL, Oracle, SQLite (database service)
- [ ] Cloud platforms: Microsoft 365, Google Workspace, cloud storage (cloud service)
- [ ] Hardening includes immutable, isolated backups and a full test restore (hardening service)
- [ ] Evidence handling suitable for official investigations (Government sector)

## Technical

- [ ] DNS A record and HTTPS (docs/DEPLOYMENT.md); open TCP 80/443 in the Oracle Cloud security list
- [ ] SMTP credentials in `/etc/recovik/recovik.env`; send a test report and a test message
- [ ] Optional: Turnstile keys + `features.captcha: true`; analytics + `features.analytics.enabled: true`
- [ ] `SITE_URL=https://recovik.com` and redeploy when moving domains
- [ ] Search Console: verify domain, submit sitemap
- [ ] securityheaders.com and SSL Labs (expected A+ / A)
- [ ] `pnpm launch:check --strict` passes
