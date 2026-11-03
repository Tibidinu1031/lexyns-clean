# Lexyns CLEAN — website pentru firma de curățenie din Sibiu

Site static, responsive, în limba română. **`index.html` din rădăcina proiectului este pagina principală.** Tot ce trebuie pentru rulare este inclus local: CSS, JavaScript, fonturi și ilustrații SVG inline. Nu e nevoie de framework, instalare de dependențe, backend sau build pentru GitHub Pages.

## Publicare pe GitHub Pages

1. Urcă proiectul în repository-ul GitHub. Include `index.html`, `styles.css`, `fonts.css`, `app.js`, tot folderul `assets/` și `.nojekyll` în rădăcină.
2. Deschide **Settings → Pages** în repository.
3. Alege **Deploy from a branch**, selectează branch-ul (de obicei `main`), folderul **`/ (root)`** și salvează.
4. Deschide adresa afișată de GitHub după publicare.

Toate căile sunt relative, deci funcționează atât pe `username.github.io`, cât și pe `username.github.io/repository-name/`.

## Previzualizare și editare

Cu Node.js instalat, rulează `npm run dev` și deschide http://127.0.0.1:4173. Pentru a simula un subfolder GitHub Pages: `node server.mjs --base=/lexyns/` și deschide http://127.0.0.1:4173/lexyns/.

`npm run check` verifică sintaxa JavaScript. `npm run build` copiază opțional site-ul în `dist/` pentru alte servicii de hosting.

## Design și interacțiuni

- Paletă preluată din logo-ul Lexyns CLEAN: negru-verde profund cu gradient mentă → aqua.
- Fundal ambiental: pete de culoare care plutesc lent, grilă de puncte cu paralaxă la scroll și textură fină de „hârtie”.
- Hero: butoane bold cu efect magnetic și reflex de lumină, ilustrație SVG cu acoperișurile Sibiului („ochii” care clipesc), paralaxă la mișcarea mouse-ului, bule de săpun care se sparg la atingere, checklist animat și insignă rotativă.
- Benzi marquee încrucișate cu servicii (se opresc la hover).
- Statistici cu numărătoare animată și carduri care se înclină după cursor.
- Servicii în acordeon animat, cu spotlight care urmărește cursorul; fiecare „Cere ofertă” preselectează serviciul în fereastra de ofertă.
- Carusel „Cameră cu cameră” cu carduri 3D și bife animate.
- „Înainte & după”: geam prăfuit pe care vizitatorul îl curăță cu mouse-ul sau degetul (plus buton „Curăță tot”).
- „Cum lucrăm”: linie de progres care se umple la scroll.
- Contact: copiere număr de telefon, rating Google, program nonstop.
- Fereastră „Cere o ofertă”: alegi serviciul, suprafața și frecvența, iar mesajul se trimite prin SMS sau se copiază.
- Setările „reduce motion” sunt respectate; linkurile de telefon funcționează și fără JavaScript.

## Conținut de verificat înainte de lansare

Datele de contact provin de pe pagina de Facebook și profilul Google al firmei: 0754 679 238, 0740 548 753, Str. Andrei Șaguna, Sibiu, program nonstop, rating 5,0 pe Google. Lista de servicii și ce include fiecare cameră sunt texte orientative — confirmă-le cu firma și ajustează-le în `index.html`. Nu există un formular cu backend; cererile de ofertă pleacă prin SMS sau telefon.
