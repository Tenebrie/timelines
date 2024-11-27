#!/bin/bash

certbot --nginx --non-interactive --agree-tos \
	--no-eff-email \
	--email 'kos94ok@gmail.com' \
	--domains "timelines.tenebrie.com"

service nginx status
service nginx stop