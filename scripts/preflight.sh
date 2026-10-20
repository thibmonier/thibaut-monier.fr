#!/bin/sh
# Contrôle d'environnement avant un lot de travail (make preflight, action 4 de la rétro du sprint 2).
# Échoue (code 1) si l'espace libre est sous PREFLIGHT_MIN_GB (8 par défaut, action 4 de la rétro du sprint 3), si Docker n'est pas
# démarré ou si la branche n'est pas propre. Ne lance JAMAIS de prune global : seules des
# suggestions de nettoyage limité au projet sont affichées.
#
# Variables : PREFLIGHT_MIN_GB (seuil, défaut 8) ; PREFLIGHT_PATH (dossier mesuré, défaut .) ;
# PREFLIGHT_FREE_KB (espace libre simulé, pour les tests) ; PREFLIGHT_SKIP_DOCKER=1 et
# PREFLIGHT_SKIP_GIT=1 (ignorent le contrôle correspondant, pour les tests et les worktrees d'agents).
set -u

min_gb="${PREFLIGHT_MIN_GB:-8}"
failed=0

if [ -n "${PREFLIGHT_FREE_KB:-}" ]; then
  free_kb="$PREFLIGHT_FREE_KB"
else
  free_kb=$(df -Pk "${PREFLIGHT_PATH:-.}" | awk 'NR==2 { print $4 }')
fi
free_gb=$(awk -v k="$free_kb" 'BEGIN { printf "%.1f", k / 1048576 }')

# Plafond de workers (checklist de démarrage du sprint 3, §4.3) : 2 dès 3 Go libres, 1 en dessous, 0 sous 1,5 Go.
workers=$(awk -v k="$free_kb" 'BEGIN { g = k / 1048576; print (g >= 3 ? 2 : (g >= 1.5 ? 1 : 0)) }')

echo "Espace libre : ${free_gb} Go (seuil ${min_gb} Go)"
if [ "$workers" -eq 0 ]; then
  echo "Plafond de workers : 0 (sous 1,5 Go libres : arrêter tout build)"
else
  echo "Plafond de workers : ${workers}"
fi

below=$(awk -v k="$free_kb" -v m="$min_gb" 'BEGIN { print (k / 1048576 < m ? 1 : 0) }')
if [ "$below" -eq 1 ]; then
  echo "ÉCHEC : espace libre insuffisant (${free_gb} Go, ${min_gb} Go requis)." >&2
  echo "Nettoyage autorisé, limité au projet : docker compose -p <projet> down -v ; docker builder prune -f" >&2
  echo "Jamais de prune global (volumes d'autres projets déjà perdus)." >&2
  failed=1
fi

if [ "${PREFLIGHT_SKIP_DOCKER:-}" = "1" ]; then
  echo "Docker : contrôle ignoré (PREFLIGHT_SKIP_DOCKER=1)"
elif docker info >/dev/null 2>&1; then
  echo "Docker : démarré"
  docker system df
else
  echo "ÉCHEC : Docker n'est pas démarré." >&2
  failed=1
fi

if [ "${PREFLIGHT_SKIP_GIT:-}" = "1" ]; then
  echo "Branche : contrôle ignoré (PREFLIGHT_SKIP_GIT=1)"
elif [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "ÉCHEC : la branche n'est pas propre (modifications non commitées)." >&2
  failed=1
else
  echo "Branche : propre"
fi

exit "$failed"
