#!/bin/bash

# Forcefully remove containers for this project
docker ps -a --filter "name=dougu_backend" -q | xargs -r docker rm -f

# Specifically target the problematic container ID if it persists
docker rm -f 368f9ef5cc86 2>/dev/null || true

# Clean up orphans and volumes for this project
docker compose down --remove-orphans -v

# Prune unused docker objects to be sure
docker system prune -f

echo "Cleanup complete. You can now try: docker compose up -d"
