#!/bin/bash

# Read the environment secret
ENV=$(cat /run/secrets/environment)

if [ "$ENV" == "staging" ]; then
  DOMAINS="-d staging.tenebrie.com -d staging.neverkin.com -d app.staging.neverkin.com"
else
  DOMAINS="-d timelines.tenebrie.com -d neverkin.com -d app.neverkin.com"
fi

certbot --nginx --non-interactive --agree-tos \
	--no-eff-email \
	--expand \
	--email 'kos94ok@gmail.com' \
	$DOMAINS

service nginx status
service nginx stop