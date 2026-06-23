# Føroyskt úttøkukrav-skipan

Hendan útgávan hevur betrað stovnan av nýggjum kappingum og kappingarbólkum.

## Broytingar í hesi útgávu

- Rættað: **Stovna kapping** riggar nú, tá nýggjur bólkur verður stovnaður.
- **Aldursbólkur** er tikin burtur sum separat val, tí **Kappingarslag** stýrir sama logikki.
- Masters aldursbólkar verða nú bert vístir, tá **Masters** er valt sum kappingarslag.
- **Kappingarslag** hevur nú fleiri val:
  - U15
  - U17
  - Ung
  - Junior
  - Senior
  - Masters
  - Open
- Tá kapping verður løgd afturat einum verandi bólki, verða **Navn á bólki** og **Stutt heiti** ikki víst.
- **Kravstig** er nú stigvíst:
  - Úttøkukrav
  - A
  - A + B
  - A + B + C
- Tað ber ikki longur til at velja B uttan A ella C uttan A + B.

Alt verður framvegis goymt í kagaranum við `localStorage`.


## Bótføring

- Rættað stovnan av nýggjum bólki, so knappurin **Stovna kapping** nú virkar í nýggja bólka-flowinum.


## Nýtt í hesi útgávu

- Tað ber nú til at strika einstakar kappingar í **Stillingar → Úttøkukrøv**.
- Tað ber nú til at strika heilar kappingarbólkar. Hetta strikar allar kappingar í bólkinum.
- Striking krevur váttan, so tað ikki hendir av óvart.
- Seinasta kappingin ella seinasti kappingarbólkurin kann ikki strikast, so síðan ikki endar uttan innihald.


## Seinastu UI-broytingar

- Strika bólk er nú ein einfaldur X-knøttur.
- Vektflokkur-input í úttøkukrava-editorinum er minni.
- Leiting og endurstilling av úttøkukrøvum eru tikin burtur.
- Stillingar-tabs eru nú: Úttøkukrøv, Lækkingar og % regla.
