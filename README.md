# Lexyns CLEAN — website pentru firma de curățenie din Sibiu

Site static, responsive, în limba română. **`index.html` din rădăcina proiectului este pagina principală.** Tot ce trebuie pentru rulare este inclus local: CSS, JavaScript, fonturi și ilustrații SVG inline. Nu e nevoie de framework, instalare de dependențe, backend sau build pentru GitHub Pages.

## Publicare pe GitHub Pages

1. Urcă proiectul în repository-ul GitHub. Include `index.html`, `styles.css`, `fonts.css`, `app.js`, tot folderul `assets/` și `.nojekyll` în rădăcină.
2. Deschide **Settings → Pages** în repository.
3. Alege **Deploy from a branch**, selectează branch-ul (de obicei `main`), folderul **`/ (root)`** și salvează.
4. Deschide adresa afișată de GitHub după publicare.

La fiecare publicare, mărește numărul `?v=` de la `fonts.css`, `styles.css` și `app.js` din `index.html`. GitHub Pages lasă browserele să păstreze fișierele 10 minute, iar fără număr nou o pagină nouă se poate încărca cu stiluri vechi.

Toate căile sunt relative, deci funcționează atât pe `username.github.io`, cât și pe `username.github.io/repository-name/`.

## Previzualizare și editare

Cu Node.js instalat, rulează `npm run dev` și deschide http://127.0.0.1:4173. Pentru a simula un subfolder GitHub Pages: `node server.mjs --base=/lexyns/` și deschide http://127.0.0.1:4173/lexyns/.

`npm run check` verifică sintaxa JavaScript. `npm run build` copiază opțional site-ul în `dist/` pentru alte servicii de hosting.

## Design și interacțiuni

- Logo-ul Lexyns CLEAN (`assets/logo.webp`, `assets/logo-mark.webp`, favicon) apare pe ecranul de încărcare, în header, în insigna din hero și în footer. Paleta e preluată din logo: negru-verde profund cu gradient mentă → aqua.
- Ecran de încărcare o dată pe sesiune: logo care se înclină după cursor și lasă scântei; un click, un scroll sau o tastă intră imediat pe site.
- Hero-ul ocupă exact înălțimea ecranului sub meniu, fără scroll, pe laptop și pe telefon. Pe telefon, scena devine fundalul textului.
- Scena din hero: găleată cu mop și spumă, spray Lexyns, burete și lavete, pe straturi SVG separate (paralaxă doar cu `transform`), bule de săpun care se sparg la atingere, checklist animat și insignă rotativă.
- Bandă marquee cu servicii, statistici cu numărătoare, servicii în acordeon, carusel „Cameră cu cameră”, geam de curățat cu mouse-ul sau degetul, linie de progres la „Cum lucrăm”.
- Fereastra „Cere o ofertă”: alegi serviciul, suprafața și frecvența, iar mesajul se trimite prin SMS sau se copiază.

## Performanță

- Fără strat de fundal fix, fără `backdrop-filter` și fără urmărirea cursorului prin repictare; animațiile se opresc când nu sunt pe ecran.
- Trei fonturi WOFF2 (13 KB fiecare, cu diacritice) și logo-uri WebP.
- **Mod ușor automat:** dacă browserul nu are accelerare video sau rulează constant cu cadre lente, site-ul adaugă clasa `lite` pe `<html>` și renunță la mișcarea de fundal (bule, bandă, paralaxă, înclinare). Hover-urile, acordeonul, caruselul, geamul și oferta rămân. Alegerea se păstrează în `localStorage` (`lexyns-lite`).
- Adaugă `?full` la adresă ca să vezi toate efectele pe un astfel de calculator.
- Setările „reduce motion” sunt respectate; linkurile de telefon funcționează și fără JavaScript.

## Conținut de verificat înainte de lansare

Datele de contact provin de pe pagina de Facebook și profilul Google al firmei: 0754 679 238, 0740 548 753, Str. Andrei Șaguna, Sibiu, program nonstop, rating 5,0 pe Google. Lista de servicii și ce include fiecare cameră sunt texte orientative — confirmă-le cu firma și ajustează-le în `index.html`. Nu există un formular cu backend; cererile de ofertă pleacă prin SMS sau telefon.
