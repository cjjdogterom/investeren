#!/bin/zsh
# Zet de geheimen van de Trading 212-koppeling op Cloudflare. Draai dit zelf in de terminal:
#   ./workers/t212/koppel.sh
# Je API-sleutel en secret worden alleen hier ingetypt en gaan rechtstreeks naar Cloudflare.
set -e
cd "$(dirname "$0")"
export PATH=/usr/local/bin:$PATH
echo "Trading 212 > Instellingen > API: maak een sleutel met alleen leesrechten"
echo "(account, portfolio, history:orders, history:dividends, history:transactions, pies:read, metadata)."
echo
read -rs "KEY?Plak je API-sleutel (API key): "; echo
read -rs "SECRET?Plak je API-secret: "; echo
[[ -n "$KEY" && -n "$SECRET" ]] || { echo "Sleutel of secret ontbreekt."; exit 1; }
print -rn -- "$KEY"    | npx -y wrangler@4 secret put T212_KEY >/dev/null
print -rn -- "$SECRET" | npx -y wrangler@4 secret put T212_SECRET >/dev/null
DEEL=$(openssl rand -hex 24)
print -rn -- "$DEEL"   | npx -y wrangler@4 secret put DEELSLEUTEL >/dev/null
unset KEY SECRET
echo
echo "Klaar. Plak deze deelsleutel in de Investeren-app bij Instellingen > Trading 212:"
echo
echo "  $DEEL"
echo
