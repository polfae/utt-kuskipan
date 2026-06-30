# Úttøkukrøv

Statisk HTML/CSS/JavaScript síða til at umsita og kanna føroysk úttøkukrøv í vektlyfting.

## Dátukelda

Firestore skjalið `qualificationSystems/faroe` er keldan til almennu úttøkukrøvini.

- Um Firestore dátur verða lisnar inn, vísir síðan tær dátur.
- Um Firestore ikki kann lesast, vísir síðan eina greiða fráboðan um, at úttøkukrøvini ikki eru tøk.
- Síðan vísir ikki longur gomul hardcoded úttøkukrøv sum fallback.
- `localStorage` verður brúkt sum lokal hjálp/cacha meðan brúkarin arbeiðir, men verður ikki brúkt sum almenn fallback-dátukelda um Firestore miseydnast.
- Trygdaravrit kann takast niður og lesast inn aftur sum JSON.

## Firebase backend

Denne útgávan brúkar Firebase Authentication og Cloud Firestore.

- Úttøkukrøvini kunnu síggjast alment.
- Stillingar krevja innriting við Firebase Authentication.
- Broytingar verða goymdar í Firestore í skjalinum `qualificationSystems/faroe`.

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

## Høvuðsvirkni

- Tvídystur-kappingar við kravum eftir kyni og vektflokki.
- Stig-kappingar við Sinclair, Q-points, Q-Masters, GAMX, GAMX-M, GAMX-A og GAMX-U.
- Aldursbólkar/eligibility fyri bæði Tvídystur og Stig, har tað er viðkomandi.
- Kappingar kunnu goyma bæði Tvídystur- og Stig-data, so brúkarin kann skifta aftur og fram uttan at missa dátur.
- `Dagført` verður dagført, tá kapping verður goymd.
- Backup/import-export er tøkt í stillingum.

## Point/stig calculations

- Sinclair brúkar 2025–2028 Sinclair coefficients.
- Q-points brúkar Q-points formula.
- Q-Masters brúkar Q-points × IMWA age factor.
- GAMX-variantar brúka parametrar úr `gamx-data.js`, sum er útleitt frá `GAMX_calculator_allages_current.xlsx`.

## Tests

Smoke/edge-case tests liggja í `tests/`:

```bash
node tests/point-calculations.test.js
node tests/gamx-calculations.test.js
node tests/point-edge-cases.test.js
node tests/no-stale-data.test.js
```
