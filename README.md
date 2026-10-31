# Kumpali website

Static corporate website for Kumpali Private Limited. Serve this directory with any static web host; no build step or dependencies are required. Keep `index.html`, `styles.css`, `script.js`, and `kumpali.png` together.

Local preview: `python3 -m http.server 8000`, then open http://localhost:8000.

## Brand and content

The only specified font is Aref Ruqaa Ink, loaded from Google Fonts. All corporate logos, the favicon, and social metadata use the supplied, unmodified `kumpali.png`. Product previews are explicitly illustrative. Stromule and Pangeabuy use text names because their official logo assets were not supplied. Storax uses the existing `storax.png` asset.

The portfolio groups business and local commerce (Stromule and Pangeabuy) separately from files and everyday tools (currently Storax). The commerce integration diagram refers only to Stromule and Pangeabuy. Additional applications can be added after their names and public descriptions are confirmed.

Product discovery buttons and footer links point to the supplied official destinations: https://stromule.com, https://pangeabuy.com, and https://storax.kumpali.com. No unannounced products appear on the page.

## Contact integration

The contact form validates a draft and lets visitors copy it. It does not submit, transmit, or persist personal information. The page states this beside the form and after copying. To connect a verified contact service, replace the draft-only submit handler at the end of `script.js` with the service's documented integration. Show success only after the service confirms acceptance, handle errors, and update the form explanation and privacy information accordingly. Do not add service secrets to client-side code.

The company’s registered office address supplied for the website appears in the footer: Unit 603–604, 6th Floor, Tower B, Bhutani Alphathum, Noida, Gautam Buddha Nagar, Uttar Pradesh – 201301, India. Other contact details, Stromule/Pangeabuy logos, and privacy/terms documents have not been provided.

## Accessibility and motion

Navigation supports keyboard access, visible focus, Escape to close the mobile menu, and focus movement to the selected section. Reveal animations progressively enhance visible HTML and respect reduced-motion preferences.

## Company brochure

`brochure.pdf` is linked from the hero and footer through the brochure panel in About. The panel provides a browser PDF link in a new tab and a separate download link with a descriptive filename. Include the PDF when deploying. When replacing the PDF, update the displayed page count and file size in `index.html`.
