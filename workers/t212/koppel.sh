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
echo "Let op: wat je plakt blijft onzichtbaar. Plak, druk Enter."
read -rs "KEY?1/2 Plak alleen je API key: "; echo
read -rs "SECRET?2/2 Plak alleen je API secret: "; echo
echo "Ontvangen: key van ${#KEY} tekens, secret van ${#SECRET} tekens."
[[ -n "$KEY" && -n "$SECRET" ]] || { echo "Sleutel of secret ontbreekt."; exit 1; }
print -rn -- "$KEY"    | npx -y wrangler@4 secret put T212_KEY >/dev/null
print -rn -- "$SECRET" | npx -y wrangler@4 secret put T212_SECRET >/dev/null
unset KEY SECRET
# Bestaat er al een deelsleutel, dan blijft die geldig (niets aanpassen in de app). Nieuwe? Draai met --nieuwe-deelsleutel.
if [[ "$1" != "--nieuwe-deelsleutel" ]] && npx -y wrangler@4 secret list 2>/dev/null | grep -q '"DEELSLEUTEL"'; then
  echo
  echo "Klaar. Je bestaande deelsleutel blijft geldig: tik in de app op 'Nu synchroniseren'."
  echo
  exit 0
fi
DEEL=$(openssl rand -hex 24)
print -rn -- "$DEEL"   | npx -y wrangler@4 secret put DEELSLEUTEL >/dev/null
echo
echo "Klaar. Plak deze deelsleutel in de Investeren-app bij Instellingen > Trading 212:"
echo
echo "  $DEEL"
echo
