## Creating new cluster

This is an unorganized doc with notes about what needs to be done for a new cluster to run.

### Volumes

- Create and mount the following volumes into the manager-1 node:
  - `/mnt/volume_rhea_postgres`
  - `/mnt/volume_secrets`
    - Mount them under different names and create symlinks to those locations

### Secrets

- Generate a JWT auth key, place it into `/mnt/volume_secrets/keys/jwt-secret.txt`
  - Just the key without formatting or anything
- 
`docker secret create jwt-secret /mnt/volume_secrets/keys/jwt-secret.txt`
`echo "production" | docker secret create ENVIRONMENT -`

### S3
- Set up a new Spaces bucket through the UI and grab a new access token.
- Install AWS CLI:
  - `apt install awscli`
- Setup credentials:
  - `aws configure`:

> AWS Access Key ID [None]: [...]
> AWS Secret Access Key [None]: [...]
> Default region name [None]: fra1
> Default output format [None]: json

### Setup app

- Clone the Timelines repository
  - `cd ~`
  - `git clone git@github.com:Tenebrie/timelines.git`
  - `cd timelines`
- Switch to desired branch
  - `git checkout dev`
    - The deployed app version is not dependent on the selected branch, but the migrations are pulled from Git. Attempting to deploy a version with mismatched migrations will probably break.
- Init Swarm cluster
  - `I forgor the commands`
  - `docker swarm init`
- Deploy the app
  - `VERSION=v1.2.3 ./scripts/stack-update.sh`
- Run migrations
  - `./scripts/stack-migrate.sh`