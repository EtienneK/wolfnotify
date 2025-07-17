# WolfNotify

WolfNotify aims to make PIN code entry for the [Wolf](https://games-on-whales.github.io/wolf/stable/index.html) client pairing process as easy as possible.

It does this by sending out-of-band notifications to your personal mobile device or web browser whenever a Wolf Pending Pair Request is available. These notifications contain links to the WolfNotify web application where you can easily enter the PIN and complete the Wolf client pairing process.

## Notification providers

At the moment, only mobile push notifications using [ntfy](https://ntfy.sh/) is supported; but more providers and channels are planned for the future.

### ntfy

From [the ntfy website](https://ntfy.sh/):

> ntfy (pronounced notify) is a simple HTTP-based pub-sub notification service. It allows you to send notifications to your phone or desktop via scripts from any computer, and/or using a REST API. It's infinitely flexible, and 100% free software.

Server side, you can either [self-host your own ntfy server](https://docs.ntfy.sh/install/); or [make use of the publicly available server](https://docs.ntfy.sh/) at ntfy.sh. Both options are supported by WolfNotify.

Client side, ntfy offers the following mobile device- and web clients:

- [Android on Google Play](https://play.google.com/store/apps/details?id=io.heckel.ntfy&pli=1)
- [Android on F-Droid](https://f-droid.org/en/packages/io.heckel.ntfy/)
- [iOS on the App Store](https://apps.apple.com/us/app/ntfy/id1625396347)
- [Web app for web browsers](https://ntfy.sh/app)

## Running WolfNotify

WolfNotify is distributed as a Docker image. The latest image can be pulled from `ghcr.io/etiennek/wolfnotify:latest`

### Docker Compose examples

#### Using public <https://ntfy.sh> server

The easiest and simplest way to configure and run WolfNotify is to use the [public ntfy server](https://docs.ntfy.sh/).

This is done by leaving the `NTFY_URL` environment variable undefined. WolfNotify will then auto-generate a ntfy.sh topic path for you using [nanoid](https://github.com/ai/nanoid). The full URL (including the generated topic path) can be seen in the WolfNotify logs. This URL is used to subscribe to the ntfy push messages in a ntfy client of your choosing.

To prevent recreating a new ntfy URL whenever the WolfNotify container gets recreated, be sure to mount a volume to the WolfNotify cache directory (default `/app/cache`). See below for an example.

```yaml

volumes:
  cache:

services:

  wolfnotify:
    image: ghcr.io/etiennek/wolfnotify:latest
    restart: unless-stopped
    environment:
      - BASE_URL=https://wolfnotify.example.local # This URL is the URL displayed in the push-message and is used to enter the PIN for pairing. Thus, replace this with a URL that is accessible to the device receiving the push-message; example `http://192.168.0.123:4000` if on local LAN. **WARNING**: there is no access control for the PIN entry page, thus beware when exposing this to the internet.
    volumes:
      - /var/run/wolf:/var/run/wolf
      - cache:/app/cache


  #########################################################
  # Example Wolf service configuration
  #   - change as required for your specific situation
  #   - Make sure that the `WOLF_SOCKET_PATH` matches the
  #     `WOLF_API_SOCKET_PATH` from WolfNotify
  wolf:
    image: ghcr.io/games-on-whales/wolf:stable
    environment:
      - XDG_RUNTIME_DIR=/tmp/sockets
      - HOST_APPS_STATE_FOLDER=/etc/wolf
      - WOLF_SOCKET_PATH=/var/run/wolf/wolf.sock
    volumes:
      - /etc/wolf/:/etc/wolf
      - /var/run/wolf:/var/run/wolf
      - /tmp/sockets:/tmp/sockets:rw
      - /var/run/docker.sock:/var/run/docker.sock:rw
      - /dev/:/dev/:rw
      - /run/udev:/run/udev:rw
    device_cgroup_rules:
      - 'c 13:* rmw'
    devices:
      - /dev/dri
      - /dev/uinput
      - /dev/uhid
    network_mode: host
    restart: unless-stopped
```

#### Self-hosting your own ntfy server

It is also possible to configure WolfNotify to use a self-hosted ntfy server. This is done by configuring the `NTFY_URL` environment variable and optional `NTFY_USERNAME` and `NTFY_PASSWORD` variables if you have [access control enabled](https://docs.ntfy.sh/config/#access-control). It is not necessary to mount the WolfNotify cache directory in this case.

```yaml
services:

  wolfnotify:
    image: ghcr.io/etiennek/wolfnotify:latest
    restart: unless-stopped
    environment:
      - BASE_URL=https://wolfnotify.example.local
      - NTFY_URL=https://ntfy.example.com/secret_topic_path
      - NTFY_USERNAME=ntfy_user
      - NTFY_PASSWORD=ntfy_password_123456
    volumes:
      - /var/run/wolf:/var/run/wolf

  ntfy:
    # See https://docs.ntfy.sh/install/#docker
    # ...
    # ...

  wolf:
    # See example above
    # ...
    # ...
```

### Environment variables

The WolfNotify container can be further configured by passing in the following environment variables:

| Environment variable | Description | Default Value |
|---|---|---|
| `BASE_URL` | This URL is the URL displayed in the push-message and is used to enter the PIN for pairing. Thus, replace this with a URL that is accessible to the device receiving the push-message; example `http://192.168.0.123:4000` if on local LAN. **WARNING**: there is no access control for the PIN entry page, thus beware when exposing this to the internet. | <http://localhost:${SERVER_PORT}> |
| `SERVER_PORT` | Port the webserver is listening on. | 4000 |
| `SERVER_LISTEN` | Hostname the webserver is listening on. | 0.0.0.0 |
| `CRON_EXPRESSION` | Cron expression for the polling job that checks for new Pending Pair Requests. Note, that unlike normal cron, this expression also supports seconds. Default is every 3 seconds. | */3 * * * * * |
| `WOLF_API_SOCKET_PATH` | Path of the Wolf API socket. Be sure to mount it in the Wolf- and WolfNotify containers (see examples) | /var/run/wolf/wolf.sock |
| `NTFY_URL` | URL of the ntfy topic that Wolf Pending Pair Requests will be published to. If left undefined, then a random topic on https://ntfy.sh will be generated using [nanoid](https://github.com/ai/nanoid). In this case, see the WolfNotify logs or the `CACHE_PATH` directory for the generated topic path. It is also possible to host your own ntfy server and configure it here. See the [ntfy docs for more information in this regard](https://docs.ntfy.sh/install/). | <https://ntfy.sh/${nanoid()}> |
| `NTFY_USERNAME` | If self-hosting your own ntfy server and you are using [access control](https://docs.ntfy.sh/config/#access-control), then you can use this environment variable to configure the username of the user that has access to publish to the topic. | `undefined` |
| `NTFY_PASSWORD` | Password of the user as discussed above. | `undefined` |
| `CACHE_PATH` | Directory containing cached data. At the moment this is only used to cache the generated ntfy.sh topic when no `NTFY_URL` is configured (see above). This is to ensure that you don't generate a new topic whenever the container is recreated. If you are using an auto-generated `NTFY_URL`, Be sure to mount a volume mapped to this path (see Docker Compose examples above). | /app/cache |

## Development

```sh
bun install
bun run dev
```

```sh
open http://localhost:4000
```
