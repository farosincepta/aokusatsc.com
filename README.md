# AO Koropiou USA Table Soccer Club — website

A static site (HTML, CSS, a little JavaScript) for GitHub Pages. No build step: upload the folder as it is.

## Pages

```
index.html      Home: banner, who we are, AO Koropiou block, latest news, about the game, join us
news.html       Latest news + "Our roots" archive (Chicago United TSC / Chicago TSC, 2015–2019)
post.html       A single news post (post.html?id=...)
club.html       Who we are, Subbuteo in Illinois timeline, achievements, organizations, AO Koropiou block
conduct.html    Club values and FISTF fair-play principles
game.html       The organized game: FISTF, WASPA, ASA, national associations
equipment.html  Board, pitch, goals, ball, teams; suppliers
contact.html    Contact form (sends to aok.usa.tsc@gmail.com)
404.html        Page not found
```

## Publishing on GitHub Pages

1. Upload everything in this folder to the root of your repository.
2. Settings → Pages → Deploy from branch → `main` / root.
3. For your own domain, add it under Settings → Pages → Custom domain, and add the DNS record at Porkbun (a CNAME pointing to `<your-username>.github.io`).

## Activate the contact form (one time)

The form uses FormSubmit, a free service. After the site is live:

1. Send one message through the Contact page yourself.
2. FormSubmit emails an activation link to **aok.usa.tsc@gmail.com**. Click it.
3. From then on, every message arrives in that inbox. Replying goes straight to the sender.

## Adding news

Edit `data/news.json`. Add a new entry at the top of `"posts"`:

```json
{
  "id": "spring-tournament-2027",
  "date": "2027-04-12",
  "tag": "Tournament",
  "title": "Spring tournament",
  "summary": "One sentence for the news card.",
  "cover": { "big": "12.04", "small": "Tournament" },
  "body": ["First paragraph.", "Second paragraph."]
}
```

- `id`: short, lowercase, hyphens, unique (it becomes the post's link).
- `cover` is optional; without it the card shows the date. To use a photo instead, upload it to `assets/img/` and add `"image": "assets/img/your-photo.jpg"`.
- The home page shows the newest three items automatically.

## Changing links and the email

The links to AO Koropiou, the Facebook pages and the email address appear in the page files and in `assets/js/config.js` (which the form uses). To change one, use GitHub's search for the old value and replace it in every file.

## Notes

- News loads from `data/news.json`, so it only appears when the site is served (GitHub Pages, or a local server), not when opening the files by double-click.
- Images: `assets/img/` (crest in several sizes, the banner, and two crops of it for phones).
