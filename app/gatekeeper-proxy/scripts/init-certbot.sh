#!/bin/bash

# Read the environment secret
ENV=$(cat /run/secrets/environment)

if [ "$ENV" == "staging" ]; then
  DOMAIN="staging.tenebrie.com"
else
  DOMAIN="timelines.tenebrie.com"
fi

certbot --nginx --non-interactive --agree-tos \
	--no-eff-email \
	--email 'kos94ok@gmail.com' \
	--domains "$DOMAIN"

service nginx status
service nginx stop