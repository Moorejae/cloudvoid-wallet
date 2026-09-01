# CloudVoid Wallet — Implementation Plan

> Status: **locked architecture, awaiting valid Alchemy API keys.** UI is final (per user). This doc is the source of truth for turning the UI into a real, non-custodial, multi-chain wallet.

## 1. Product scope (locked)

- **Navigation:** Wallet / History / Web3 / Settings only. No FiatHub, no P2P, no virtual cards.
- **Chains (all at once):** Aptos, Bitcoin Cash, Litecoin, Avalanche, BNB Smart Chain, Ethereum, Solana, Tron, opBNB, Bitcoin, Polygon, Plasma, Stellar, Dogecoin, Mantle.
- **Swap:** 1inch aggregator.
- **DB:** Postgres (Neon, managed). DSN provided in `.env`.
- **Web wallet:** encrypted vault (user password → PBKDF2 → AES-256-GCM). Seed phrase shown **once** at creation.
- **Custody:** non-custodial — the server never sees mnemonics/private keys; only public addresses are indexed.

## 2. Infrastructure (locked)

| Component | Host |
|---|---|
| Frontend UI (Expo web build) | Cloudflare |
| Backend application (Express API) | Oracle server `146.235.194.13` (`cloudvoid_node_key`) |
| Riverbed master encryption key | Oracle server `138.2.225.202` (`cloudvoid_v6_key`) |
| Postgres | Neon (managed) |
| Source of truth | GitHub |

- **Riverbed encryption:** frontend ↔ backend communicate only via an encrypted envelope (ECDH **P-256** handshake → HKDF-SHA256 → per-session AES-256-GCM keys). P-256 chosen over X25519 because browser WebCrypto (Cloudflare frontend) supports it universally. Master key (server ECDH private key) lives on the backend Oracle VPS only (`ai-backend/keys/server_ecdh.pem`); Cloudflare never holds it. HTTPS transport on top.
- **Port masking:** no default ports (e.g., avoid 3000); non-standard port + Oracle Cloud Security List restricted to Cloudflare IPs; prefer Cloudflare Tunnel (zero open ports).
- **Containers:** Docker on the Oracle instances to isolate/limit the 1 GB/1 CPU footprint (lightweight images, restart policies, swap file).

## 3. Chain registry (Phase 0 deliverable)

**Alchemy auth (verified 2026-08-13):** `ALCHEMY_API_KEYS` is comma-separated. Keys are the new `alch_` format and MUST be sent as `Authorization: Bearer <key>` against `https://<slug>.g.alchemy.com/v2` — **NOT** in the URL path (path method returns 401). Each key serves exactly 5 networks:

| Chain | Alchemy slug | chainId | Key | Notes |
|---|---|---|---|---|
| Ethereum | `eth-mainnet` | 1 | KEY3 | EVM |
| Polygon | `polygon-mainnet` | 137 | KEY2 | EVM |
| BNB Smart Chain | `bnb-mainnet` | 56 | KEY1 | EVM |
| opBNB | `opbnb-mainnet` | 204 | KEY3 | EVM |
| Avalanche C-Chain | `avax-mainnet` | 43114 | KEY1 | EVM |
| Mantle | `mantle-mainnet` | 5000 | KEY2 | EVM |
| Plasma | `plasma-mainnet` | 9745 | KEY2 | Reth-based EVM L2 |
| Bitcoin | `bitcoin-mainnet` | — | KEY3 | UTXO |
| Bitcoin Cash | `bitcoincash-mainnet` | — | KEY1 | UTXO |
| Litecoin | `litecoin-mainnet` | — | KEY1 | UTXO |
| Dogecoin | `dogecoin-mainnet` | — | KEY2 | UTXO |
| Solana | `solana-mainnet` | — | KEY3 | non-EVM |
| Tron | `tron-mainnet` | — | KEY3 | TRX + TRC20 |
| Aptos | `aptos-mainnet` | 1 | KEY1 | Move |
| Stellar | `stellar-mainnet` | — | KEY2 | Horizon-style |

- Registry maps each chain → (keyIndex, slug). Requests use `POST https://<slug>.g.alchemy.com/v2` with `Authorization: Bearer <key>`.
- chains NOT covered by Alchemy (none for our list — all 15 verified reachable) get official/public RPC + explorer fallback.

## 4. Build phases

### Phase 0 — Foundation & security
- ✅ `ai-backend/config/chains.js` — chain registry (15 chains, slug + keyIndex + kind + decimals + explorer).
- ✅ `ai-backend/services/alchemyClient.js` — Alchemy client with `Authorization: Bearer <key>` auth + per-chain key selection.
- ✅ `ai-backend/services/riverbed.js` — server envelope crypto (P-256 ECDH + HKDF + AES-GCM); master key auto-generated at `keys/server_ecdh.pem`.
- ✅ `src/services/crypto/riverbed.ts` — client envelope crypto (WebCrypto).
- ✅ `src/services/crypto/vault.ts` — encrypted vault (PBKDF2-SHA256 310k + AES-256-GCM).
- ✅ Endpoints: `GET/POST /api/health/chains` (all 15 verified up/reachable), `GET /api/riverbed/pubkey`, `POST /api/riverbed/ping` (round-trip PASS).
- ✅ `src/services/chains.ts` — frontend chain metadata mirror (no keys/slugs).
- ✅ `src/services/api/riverbedClient.ts` — envelope-wrapped client (pubkey fetch, session cache, `envelopeRequest`).
- ✅ `src/services/riverbedApi.ts` — typed API (`riverbedPing`, `fetchChainHealth`) through the envelope.
- ✅ `scripts/test-riverbed-web.mts` (runs real frontend module via `tsx`) — **WEB RIVERBED ROUND-TRIP: PASS**.
- ⏳ Phase 1: migrate existing `web3Api.ts` endpoints onto the envelope alongside the backend endpoint rewrite; replace `cryptoService` EVM fetch spam with the Alchemy layer.

### Phase 1 — Wallet core  ✅ DONE
- ✅ `src/services/wallet/derive.ts` — client-side derivation for ALL 15 chains (EVM×7 shared, BTC, BCH, LTC, DOGE, SOL, TRX, APT, XLM). **PURE-JS** (`@scure/bip32` secp256k1 + `ed25519-hd-key` SLIP-0010 ed25519 + `@noble/*` + `@scure/base`) so the SAME file runs on native AND web — fixes the `ecc library invalid` Metro runtime error (tiny-secp256k1 WASM doesn't load in web). ETH & BTC verified against official BIP-39 vectors; SOL vs known SLIP-0010 value; Stellar StrKey verified against official vector (little-endian CRC16).
- ✅ `src/services/wallet/storage.ts` — web: encrypted vault (PBKDF2 + AES-GCM) in localStorage; native: SecureStore. Public addresses stored plainly (non-secret).
- ✅ `src/services/wallet/balances.ts` — envelope-protected balance fetch (public addresses only).
- ✅ `src/components/VaultPasswordModal.tsx` — web vault password set/unlock.
- ✅ Rewired CreateWallet / ImportWallet / SeedPhraseVerify — non-custodial: derive locally, encrypt into vault, NEVER send mnemonic/keys to backend (removed mnemonic from `/api/wallet/register` calls).
- ✅ `wallet-engine.ts` + `wallet-engine.web.ts` re-export the real engine (web wallet enabled — stub removed).
- ✅ `walletStore.ts` — hydrates userId/wallets from persisted session; mnemonic storage via vault/SecureStore.
- ✅ `DashboardScreen` — live balances via envelope (price + 24h change per chain).
- ✅ Backend `balanceService.js` + `POST /api/wallet/balances` (envelope) — real balances for all 15 chains (Alchemy + mempool.space + Blockchair + TronGrid + Aptos fullnode + Horizon).
- ✅ Verified end-to-end: `scripts/test-fullflow.mts` — derive → envelope → real balances, all 15 chains `status=ok`.
- ⏳ Remaining: old `/api/wallet/register|balance|assets` endpoints still route through legacy `cryptoService` (unused by app now) — clean up in Phase 3; full signing (Phase 2) needs the vault-unlock prompt.

### Phase 2 — Transactions
- Send (fee estimate → local sign → broadcast → confirm) per chain; Receive per chain.
- 1inch swap (quote → approve → swap → real tx hash).
- Real tx history via explorer/indexer + status badges.

### Phase 3 — Backend (Oracle + Neon)
- Postgres schema: users, wallets (public addresses only), transactions.
- Real auth; migrate in-memory `Map`s; riverbed key-store service live.
- Dockerize; port masking; Cloudflare Tunnel.

### Phase 4 — Feature modules
- Web3: WalletConnect + DApps real pairing/signing.
- AI concierge wired to real store actions.

### Phase 5 — Production
- Certs, Cloudflare Pages deploy, GitHub CI/CD, monitoring.

## 5. Open items
- ~~**Alchemy keys:**~~ **RESOLVED** — `alch_` keys verified valid; use `Authorization: Bearer <key>` header auth. Full key→network map in §3.
- Neon DSN to be added to `.env` (user will add).
- SSH connectivity verified only in sandbox at deploy time (keys on local device).
