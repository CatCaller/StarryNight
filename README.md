# StarryNight

Spicetify theme. Survives Spotify updates by tagging the layout from `theme.js` instead of using Spotify's class names.

## Install

Copy this folder to `%APPDATA%\spicetify\Themes\StarryNight`, then:

```
spicetify config current_theme StarryNight color_scheme Base inject_theme_js 1
spicetify apply
```

Broken after an update? Run `StarryNight.report()` in devtools.

Based on [b-chen00/StarryNight](https://github.com/b-chen00). Shooting stars by [Delroy Prithvi](https://codepen.io/delroyprithvi/pen/LYyJROR) (MIT).
