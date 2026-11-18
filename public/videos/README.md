# Hero video

Drop your hero film here as **`hero.mp4`**:

```
public/videos/hero.mp4
```

The homepage hero points at `/videos/hero.mp4` and shows the Unsplash poster
until the file exists, so the page is safe to ship before the film is ready.

## Recommended spec

- **Length:** 8–15 seconds, seamless loop
- **Resolution:** 1920×1080 (or 2560×1440 if the file stays light)
- **Codec:** H.264 MP4, `faststart`, no audio track
- **Size:** under ~6 MB for mobile-friendly loading
- **Content:** macro jewellery detail, warm light, slow movement, no text

If you also export a WebM version, add a `<source>` tag in
`src/components/HeroVideo.astro`. To change the poster, update the `poster`
constant at the top of the same file.
