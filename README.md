# Úttøkukrøv

Statisk HTML/CSS/JavaScript síða til at umsita og kanna føroysk úttøkukrøv í vektlyfting.

## Nýtt í hesi útgávuni

- Úttøkukrøv, vektflokkar og totals verða nú broytt inni í sjálvum **Broyt kapping** vindeyganum.
- Høvuðslistin undir **Stillingar → Úttøkukrøv** vísir nú bert kappingarnar; klikk á eina kapping fyri at broyta hana.
- Striking av kappingum er flutt inn í **Broyt kapping** vindeygað við einari varning.
- Tú kanst framvegis stovna, broyta og strika bólkar og kappingar.
- Tú kanst framvegis leggja vektflokkar afturat og strika vektflokkar inni á edit-vindeyganum.
- Vektflokkar verða framvegis ikki endurraðaðir meðan skrivað verður; raðingin hendir tá input verður frávalt ella Enter verður trýst.

## Brúk

Lat `index.html` upp í einum kagara ella legg mappuna á GitHub Pages.


## Latest update

Competition actions have been simplified: the settings overview only shows competition names, clicking a competition opens the edit modal, and the destructive **Strika** action is now inside the edit modal next to **Goym broytingar** with confirmation.


## Seinasta dagføring

- Kravstig í kappingar-edit vindeyganum dagførir nú úttøkukrøvini beinanvegin.
- Tá ein kapping verður broytt frá vanligum úttøkukravi til A/B/C, verða verandi krøvini flutt til A-krav.
- B-krav og C-krav verða stovnað beinanvegin, so tey kunnu broytast uttan at goyma og lata vindeygað upp aftur.
- Tá A/B/C verður broytt aftur til vanligt úttøkukrav, verða A-krøvini varðveitt sum nýggja minimumskravið.

## Latest update
- Display and result tables now use equal-width columns.
- Table headers and values are centered horizontally so values align directly under their headings.

## Seinastu broytingar

- Vektflokkar á høvuðssíðuni vísa nú minus frammanfyri vanliga flokkar, t.d. `-86 kg`, meðan plussflokkar vísa `86+ kg`.
- Úttøkukrøv á høvuðssíðuni vísa nú `kg` aftaná talið.


## Static elevated cards

Cards and content containers now have a subtle permanent elevated look instead of relying on mouse hover movement.


## Latest change

Settings and edit modals are now top-aligned so switching tabs changes only the bottom height of the modal, not the top position.

## Firebase backend

Denne útgávan brúkar Firebase Authentication og Cloud Firestore.

- Úttøkukrøvini kunnu síggjast alment.
- Stillingar krevja innriting við Firebase Authentication.
- Broytingar verða goymdar í Firestore í skjalinum `qualificationSystems/faroe`.
- `localStorage` verður framvegis brúkt sum lokal cache/fallback.

Firestore reglur:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /qualificationSystems/{systemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Update
- Settings modal no longer includes its own logout button; logout remains on the main page after login.
- Masters competitions on the main page now use age-group tabs, so only one masters age group is shown at a time.


## Firestore as source of truth

This version protects the saved qualification data in Firestore. The built-in data files are only fallback/startup data and are not allowed to overwrite Firestore before the database has finished loading. Cloud saving is blocked until Firestore has been checked, so future website code updates should not reset the qualification totals stored in `qualificationSystems / faroe`.
