# Restarting GNOME Shell

## When Do You Need to Restart?

With sutto's **self-reload feature**, you rarely need to restart GNOME Shell:

- **First time installing** an extension: Yes (one-time only)
- **Updating existing extension during development**: No (use `npm run dev`)
- **Installing GNOME Shell updates**: Yes

## Self-Reload Feature (Recommended)

**For extension development, use `npm run dev` instead of restarting GNOME Shell.**

See [Development Workflow](03-development-workflow.md) for details.

## Check Your Session Type First

```bash
echo $XDG_SESSION_TYPE
```

## Restart Methods

### X11 Session

#### Using the restart script (Recommended)

```bash
./scripts/restart-gnome-shell-x11.sh
```

This script automates the Alt+F2 `r` method using `xdotool`, with a D-Bus fallback.

#### Other methods

These are the underlying commands if you need them manually:

```bash
# Using killall
killall -3 gnome-shell

# Using busctl
busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting…")'

# Or press Alt+F2, type 'r', then press Enter
```

### Wayland Session

**Wayland does not support restarting GNOME Shell without logging out.**

You must:
- Logout and login again
- Or reboot the system

## Summary

| Session Type | Restart Command | Need Logout? |
|--------------|----------------|--------------|
| X11 | `./scripts/restart-gnome-shell-x11.sh` | No |
| Wayland | N/A | Yes |

## For Extension Development

**Good news:** After the initial installation, `npm run dev` allows you to reload the extension instantly without restarting GNOME Shell!

The methods described above are only needed for:
- Initial installation
- System updates
- Troubleshooting severe errors

For normal development, see [Development Workflow](03-development-workflow.md) for the recommended self-reload workflow.
