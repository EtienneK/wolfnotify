# Docker

```sh
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -v /var/run/wolf/wolf.sock:/var/run/wolf/wolf.sock \
  -v cache:/app/cache \
  -p 4000:4000 \
  ghcr.io/etiennek/wolfnotify:latest
```

# Development

```sh
npm install
npm run dev
```

```sh
open http://localhost:4000
```
