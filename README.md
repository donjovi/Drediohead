# DREdiohead Web Player

A simple static MP3 player designed for GitHub Pages.

## Add your music

1. Put your MP3 files in the `audio` folder.
2. Open `tracks.js`.
3. Change each title and file name so they match your MP3s exactly.
4. Add or remove track objects as needed.

Example:

```js
const tracks = [
  {
    title: "Bulletproof Gangbang",
    artist: "DREdiohead",
    file: "audio/bulletproof-gangbang.mp3"
  }
];
```

## Add cover art

Replace `images/cover.jpg` with your own square JPG image. Keep the file name `cover.jpg`, or change the path in `index.html`.

## Publish with GitHub Pages

1. Create a new public GitHub repository.
2. Upload all files and folders from this project.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. GitHub will provide the public website address.

## Privacy warning

A public GitHub repository is not private or access-controlled. Anyone who finds the repository or direct MP3 URL can listen to or download the files. An unlisted link only reduces casual discovery.

For actual password protection, use a host with authentication or place the files behind a private storage service with expiring links.
