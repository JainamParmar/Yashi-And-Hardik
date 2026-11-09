# Yashi & Hardik – Wedding Invite
Static site. Open index.html or deploy the folder (Cloudflare Pages / Netlify / GitHub Pages).

## 1. EmailJS (config.js)
Set publicKey, serviceId, templateId. In your EmailJS template use these variables:
{{guest_name}} {{guest_email}} {{guest_phone}} {{attending}} {{dates}} {{guest_count}} {{message}} {{to_name}}
Set "To email" to your own address and "Reply-To" to {{guest_email}}.

## 2. Directions (config.js)
Replace `directions.day1` / `directions.day2` with Google Maps share links.

## 3. Content
- Day 2 venue and family names: search `[ ` in index.html.
- Photos: assets/hero.jpg (hero) and assets/picnic.jpg (note section). Keep names or edit the <img> tags.
- Song: assets/song.mp3. Colours: :root variables at the top of style.css.
- Countdown date: weddingDate in config.js.
Note: browsers block autoplay, so the music starts when guests tap "Open Invitation".
