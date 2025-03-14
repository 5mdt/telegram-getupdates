# Telegram GetUpdates with Docker and Traefik

This repository contains a web app that fetches updates from the Telegram Bot API and displays the data in a prettified JSON format. The app is served using Nginx and can be run with Docker and Docker Compose, and is routed through Traefik with SSL certificates automatically managed via Cloudflare DNS challenge.

## Demo

You can view a live demo of the project at:
[https://5mdt.github.io/telegram-getupdates/](https://5mdt.github.io/telegram-getupdates/)

## Repository

You can find the source code for the project here:
[https://github.com/5mdt/telegram-getupdates](https://github.com/5mdt/telegram-getupdates)

## Requirements

- Docker
- Docker Compose
- Traefik (with Docker integration)
- Cloudflare account (if using the DNS challenge for Let's Encrypt)

## Setup

### 1. Clone the repository
Clone the repository to your local machine.

```bash
git clone https://github.com/5mdt/telegram-getupdates.git
cd telegram-getupdates
```

### 2. Create a `.env` File
In the root of the project, create a `.env` file to store the following environment variables:

```bash
SERVICE_NAME_OVERRIDE=telegram-getupdates      # The name of your service (e.g., 'telegram-getupdates')
DOMAIN_NAME=local                            # The domain name to use for the app (e.g., 'local', 'example.com')
TRAEFIK_CERT_RESOLVER=letsencrypt-cloudflare-dns-challenge  # The cert resolver for Let's Encrypt via Cloudflare DNS challenge
CLOUDFLARE_API_EMAIL=your-cloudflare-email   # Your Cloudflare email address
CLOUDFLARE_API_KEY=your-cloudflare-api-key   # Your Cloudflare API key
```

Make sure to replace the placeholders with your actual values. For example, `SERVICE_NAME_OVERRIDE` could be the subdomain for your app (like `telegram-getupdates`), and `DOMAIN_NAME` could be your full domain (like `example.com` or `local` for local testing).

### 3. Configure Traefik
Ensure that Traefik is set up to work with Docker and is configured to automatically manage SSL certificates via Let's Encrypt and Cloudflare DNS challenge.

The `.env` file will automatically populate the necessary environment variables for Traefik and the Docker Compose setup.

#### Traefik's docker-compose.yaml example

```yaml
# docker-compose.yml

services:
  app:
    command:
      - --api.dashboard=true
      - --certificatesResolvers.letsencrypt-cloudflare-dns-challenge.acme.dnschallenge.provider=cloudflare
      - --certificatesResolvers.letsencrypt-cloudflare-dns-challenge.acme.dnschallenge=true
      - --certificatesResolvers.letsencrypt-cloudflare-dns-challenge.acme.email=${TRAEFIK_EMAIL:-admin@local}
      - --certificatesResolvers.letsencrypt-cloudflare-dns-challenge.acme.storage=/letsencrypt/acme.json
      - --certificatesResolvers.letsencrypt-http-challenge.acme.email=${TRAEFIK_EMAIL:-admin@local}
      - --certificatesResolvers.letsencrypt-http-challenge.acme.httpChallenge.entryPoint=web
      - --certificatesResolvers.letsencrypt-http-challenge.acme.httpChallenge=true
      - --certificatesResolvers.letsencrypt-http-challenge.acme.storage=/letsencrypt/acme.json
      - --certificatesResolvers.letsencrypt-http-challenge.acme.tlsChallenge=true
      - --entrypoints.web.address=:80
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.websecure.address=:443
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=traefik_default
      - --providers.docker=true
    env_file:
      - .env
    image: docker.io/library/traefik:${TRAEFIK_VERSION:-3.0}
    labels:
      com.centurylinklabs.watchtower.enable: "true"
      traefik.enable: true
      traefik.http.routers.traefik_https.entrypoints: websecure
      traefik.http.routers.traefik_https.rule: Host(`${SERVICE_NAME_OVERRIDE:-traefik}.${DOMAIN_NAME:-local}`)
      traefik.http.routers.traefik_https.service: api@internal
      traefik.http.routers.traefik_https.tls: true
      traefik.http.routers.traefik_https.tls.certresolver: letsencrypt-cloudflare-dns-challenge
    logging:
      driver: json-file
      options:
        max-file: "3"
        max-size: 1m
    ports:
      - 80:80
      - 443:443
      - 8080:8080
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ${GLOBAL_DATA_FOLDER:-/Data}/letsencrypt:/letsencrypt
  pycertifried:
    image: docker.io/nett00n/pycertifried:latest
    environment:
      TimeInterval: 120 # Minutes
      AcmePath: /letsencrypt/acme.json
      ExportPath: /letsencrypt/export/
      IsDaemon: true
    volumes:
      - ${GLOBAL_DATA_FOLDER:-/Data}/letsencrypt:/letsencrypt
    labels:
      com.centurylinklabs.watchtower.enable: "true"
    restart: unless-stopped
x-dockge:
  urls:
    - https://${SERVICE_NAME_OVERRIDE:-traefik}.${DOMAIN_NAME:-local}
networks: {}
```

### 4. Update `docker-compose.yml`

The `docker-compose.yml` file is configured to use environment variables from the `.env` file.

Variables you can set:

- `SERVICE_NAME_OVERRIDE`
- `DOMAIN_NAME`
- `TRAEFIK_CERT_RESOLVER`

### 5. Start the Application

Run the Docker Compose command to start the services.

```bash
docker-compose up -d
```

This will:

- Pull the Nginx Docker image.
- Mount the app’s source code to the Nginx container.
- Set up Traefik routing with SSL through Let's Encrypt and Cloudflare DNS challenge.

### 6. Access the App
Once the containers are running, navigate to the domain you've configured in your browser (e.g., `https://telegram-getupdates.local`).

You should see the Telegram Bot `getUpdates` API response displayed as prettified JSON.

## Docker Compose Configuration

The [docker-compose.yml](./docker-compose.yml) file info:

### Traefik Labels
- `traefik.enable`: Enables Traefik routing for this service.
- `traefik.http.routers.telegram-getupdates.entrypoints`: Routes traffic to `websecure` (HTTPS).
- `traefik.http.routers.telegram-getupdates.rule`: Defines the routing rule, using the configured domain.
- `traefik.http.routers.telegram-getupdates.tls`: Ensures TLS is enabled.
- `traefik.http.routers.telegram-getupdates.tls.certresolver`: Uses Cloudflare DNS challenge to obtain SSL certificates.

### Networks
The container is attached to the `traefik_default` network to allow Traefik to discover and route traffic to it.

## Troubleshooting

### Common Issues
- **DNS Resolution**: Make sure your DNS is properly set up for the domain/subdomain you're using.
- **SSL Issues**: If there are issues with SSL certificates, check the Traefik logs to ensure the Cloudflare DNS challenge is working properly.
- **Traefik Logs**: You can view Traefik logs to debug SSL and routing issues:

```bash
docker-compose logs traefik
```

## License

This project is licensed under the GPL v3 License - see the [LICENSE](LICENSE) file for details.
