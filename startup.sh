#!/bin/bash
# Azure App Service startup script
# Writes Application Settings into config.json so the SPA can read them at runtime.

CONFIG_PATH="/home/site/wwwroot/config.json"

cat <<EOF > "$CONFIG_PATH"
{
  "ENTRA_CLIENT_ID": "${ENTRA_CLIENT_ID}",
  "ENTRA_TENANT_ID": "${ENTRA_TENANT_ID}",
  "ENTRA_API_SCOPE": "${ENTRA_API_SCOPE}",
  "API_URL": "${API_URL}"
}
EOF

echo "config.json written to $CONFIG_PATH"
