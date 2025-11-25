# Development Workflow

## Development Cycle

```bash
npm run dev
```

This command builds, copies files, and reloads the extension via D-Bus.

## Viewing Logs

Monitor extension output in real-time:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

Filter for specific messages:

```bash
# Watch for reload events
journalctl -f -o cat /usr/bin/gnome-shell | grep -E "DBusReloader|Reloader"

# Check for errors
journalctl /usr/bin/gnome-shell | grep -i error
```
