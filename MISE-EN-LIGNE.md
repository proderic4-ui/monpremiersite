# 🚀 Mettre WALLBOX en ligne — Guide simple (en français)

Ce guide vous explique **pas à pas** comment passer de l'aperçu actuel
à un vrai site public comme `www.votre-site.com`.

> ⏱️ Durée : environ 30 minutes
> 💰 Coût : **gratuit** pour commencer (Vercel + Neon offrent des plans gratuits)

---

## 1. Ce qu'il vous faut (gratuit)

1. Un compte **GitHub** → https://github.com/signup
2. Un compte **Neon** (base de données) → https://neon.tech
3. Un compte **Vercel** (hébergement) → https://vercel.com/signup
   (inscrivez-vous avec votre compte GitHub, c'est plus simple)

Votre projet utilise :
- **Next.js** → parfait pour Vercel (c'est la même société)
- **PostgreSQL** → parfait pour Neon (PostgreSQL gratuit)

---

## 2. Étape 1 — Mettre votre code sur GitHub (5 min)

Sur votre ordinateur :

```bash
# 1. Téléchargez le code du projet sur votre PC
# 2. Dans le dossier du projet, lancez :
git init
git add .
git commit -m "WALLBOX en ligne"

# 3. Créez un nouveau dépôt sur https://github.com/new
#    Nom suggéré : wallbox-site
#    Ne cochez RIEN (pas de README, pas de .gitignore)

# 4. Liez et envoyez (remplacez VOTRE-NOM par votre pseudo GitHub) :
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/wallbox-site.git
git push -u origin main
```

✅ Votre code est maintenant sauvegardé sur GitHub.

---

## 3. Étape 2 — Créer la base de données gratuite (5 min)

1. Allez sur https://neon.tech et connectez-vous (avec GitHub).
2. Cliquez **« New Project »** :
   - Name : `wallbox-db`
   - Region : choisissez la plus proche (ex : `EU West` pour l'Afrique de l'Ouest)
   - PostgreSQL version : laissez par défaut
3. Cliquez **Create**.
4. Sur le tableau de bord Neon, trouvez **Connection String** et cliquez **Copy**.
   Ça ressemble à :
   ```
   postgresql://user:xxxx@ep-xxx.eu-west-1.aws.neon.tech/wallbox-db?sslmode=require
   ```
5. ⚠️ **Gardez cette adresse précieusement** — c'est votre `DATABASE_URL`.

---

## 4. Étape 3 — Mettre le site en ligne sur Vercel (10 min)

1. Allez sur https://vercel.com et connectez-vous avec GitHub.
2. Cliquez **« Add New… » → « Project »**.
3. Dans la liste, trouvez `wallbox-site` → cliquez **Import**.
4. Laissez tout par défaut (Framework = Next.js, Build = `npm run build`).
5. **AVANT de cliquer Deploy**, ouvrez la section **Environment Variables** et ajoutez :

   | Nom | Valeur |
   |-----|--------|
   | `DATABASE_URL` | L'adresse Neon copiée à l'étape 2 |
   | `AUTH_SECRET` | Une longue phrase secrète (voir ci-dessous) |

   Pour générer `AUTH_SECRET`, lancez sur votre PC :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copiez le résultat (une longue suite de lettres/chiffres).

6. Cliquez **Deploy** et attendez 2-3 minutes. 🎉
7. Vercel vous donne une adresse comme :
   ```
   https://wallbox-site.vercel.app
   ```
   → Votre site est **en ligne** ! Partagez ce lien.

---

## 5. Étape 4 — Créer les tables dans la vraie base (5 min)

Le site est en ligne mais la base Neon est encore vide. Il faut créer
les tables (`wb_users`, `wb_plans`, etc.) **une seule fois** :

Sur votre PC, dans le dossier du projet :

```bash
# 1. Mettez la vraie adresse Neon dans un terminal temporaire :
export DATABASE_URL="postgresql://user:xxxx@ep-xxx.neon.tech/wallbox-db?sslmode=require"

# 2. Modifiez temporairement drizzle.config.json :
#    remplacez "url" par votre adresse Neon, puis lancez :
npx drizzle-kit push

# 3. Remettez l'adresse locale après :
#    "url": "postgresql://postgres:postgres@127.0.0.1:5432/app_db"
```

> 💡 Astuce : vous pouvez aussi le faire depuis n'importe quel outil
> PostgreSQL (DBeaver, pgAdmin) en exécutant le SQL généré par Drizzle.

Vérifiez : rechargez votre site Vercel → créez un compte test →
si l'inscription marche, tout est bon ✅

---

## 6. Étape 5 — Avoir votre propre domaine (optionnel)

Au lieu de `wallbox-site.vercel.app`, vous pouvez avoir
`www.mon-wallbox.com` :

1. Achetez un domaine (~10 €/an) sur OVH, GoDaddy, Namecheap, Hostinger…
2. Sur Vercel : ouvrez votre projet → **Settings → Domains** → **Add**.
3. Tapez votre domaine et suivez les instructions (ajouter 2 enregistrements
   `A` / `CNAME` chez votre vendeur de domaine).
4. Attendez 5 min à 24 h → votre domaine affiche le site avec 🔒 HTTPS auto.

---

## 7. ⚠️ TRÈS IMPORTANT — Argent réel

**Actuellement, les dépôts/retraits sont SIMULÉS** :
le solde est crédité instantanément sans vrai transfert Mobile Money.
C'est parfait pour tester et démontrer.

Pour prendre du **vrai argent** (TMoney, Wave, MTN, Orange…), vous devez
brancher un agrégateur de paiement africain, par exemple :

| Pays | Solutions possibles |
|------|---------------------|
| Togo, Bénin, CI, Sénégal | **FedaPay**, **CinetPay**, **Flutterwave**, **PayDunya**, **Hub2** |

Concrètement :
1. Créez un compte pro chez l'agrégateur (avec votre entreprise + pièces).
2. Ils vous donnent une **clé API**.
3. On modifie `/api/wallet/deposit` et `/api/wallet/withdraw` pour appeler
   leur API au lieu de créditer directement.
4. Demandez-moi « branche FedaPay / CinetPay » et je l'intègre.

> ⚖️ Rappel légal : un site qui promet 8-15 %/jour est considéré comme
> un placement à risque / potentiellement pyramidal dans la plupart des
> pays. Renseignez-vous auprès d'un juriste, affichez les risques
> (c'est déjà fait en bas du site) et ne garantissez jamais les gains.

---

## 8. Mises à jour : comment modifier le site après ?

Chaque fois que vous changez le code :

```bash
git add .
git commit -m "ma modification"
git push
```

→ Vercel **redéploie automatiquement** en 2 minutes. Magique ✨

---

## 9. Résumé ultra-rapide (si vous êtes pressé)

1. Code → GitHub (`git push`)
2. Base → Neon (copier `DATABASE_URL`)
3. Site → Vercel → Import depuis GitHub + ajouter `DATABASE_URL` + `AUTH_SECRET` → Deploy
4. Tables → `npx drizzle-kit push` avec la vraie URL (1 fois)
5. Testez `https://votre-projet.vercel.app/register`
6. (Optionnel) Domaine perso dans Settings → Domains

---

## 10. Aide-mémoire des variables

| Variable | Où la trouver | Exemple |
|----------|---------------|---------|
| `DATABASE_URL` | Neon → Connection String | `postgresql://…neon.tech/…?sslmode=require` |
| `AUTH_SECRET` | Générée par vous | `a3f9c1…64 caractères…` |

En local, mettez-les dans le fichier `.env` (voir `.env.example`).
Sur Vercel, mettez-les dans **Project → Settings → Environment Variables**.

Bon lancement ! ⚡
