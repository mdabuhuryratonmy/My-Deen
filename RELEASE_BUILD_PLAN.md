# My Deen — Release build plan (Play Store)

Goal: a release-signed AAB that can be uploaded to Google Play.
Status 19 Nov 20:13 MY: code is release-ready (Fixes #5–#19, 149 tests pass);
the release AAB itself is NOT built yet — see blockers below.

## What is already ready
- versionCode 1 / versionName "1.0" (`android/app/build.gradle`) — fine for the
  FIRST Play upload. targetSdk 36, minSdk 24 (`android/variables.gradle`) —
  target 36 is above Play's requirement (35+).
- Release signing is configured (`android/app/build.gradle` signingConfigs.release
  reads `android/keystore.properties`; guarded so CI without the files still builds debug).
- `android/deen-day-release.keystore` exists ONLY in the workspace
  (`workspace/deen-day/android/`). It is NEVER in the repo and must never be
  uploaded as a file. If it is lost, Play Store updates become impossible.
- Privacy policy already in the repo: `privacy.html` (Bengali + English,
  "no account, no data collected, no ads"). Play needs its public URL — enable
  GitHub Pages on the repo (Settings → Pages → main branch) and the URL becomes
  `https://mdabuhuryratonmy.github.io/My-Deen/privacy.html`.
- Staged web code for the final build: `workspace/your_files/fix4-upload/app.js`
  (Fix #19, md5 1795c71810f4c4c2f9e50177a40e817c). It still needs uploading to
  GitHub (`www/app.js` first, then root `app.js` — separate fresh file grants;
  a grant works once only).

## Blockers (why the AAB cannot be built tonight)
1. Local Gradle is DEAD in this VM — the daemon IPC fails ("Could not receive
   a message from the daemon"), verified twice on 19 Nov (wrapper SSL download
   fails too; direct Gradle 8.14.3 fails the same way, even with a fresh
   GRADLE_USER_HOME and --no-daemon). GitHub Actions is the only build route.
2. The workflow (`.github/workflows/build-apk.yml`, current SHA 180e970f)
   builds DEBUG only. A release job must be added — and the GitHub API cannot
   write workflow files (403), so the edit goes through the user's signed-in
   browser (device Chrome on his laptop).
3. The keystore must become a GitHub secret — also a browser task, and the
   keystore file must first reach his laptop (Muse sends it as a private file
   when the laptop is on). NEVER paste the keystore or its base64 in chat, and
   never commit it to the repo.

## The release job to add (append after the "Publish debug release" step)
```yaml
      # Release (Play Store): the release AAB is signed with the release
      # keystore, which lives ONLY as GitHub secrets (never in the repo).
      # Secrets needed (repo Settings → Secrets and variables → Actions):
      #   KEYSTORE_BASE64 — base64 of android/deen-day-release.keystore
      #   KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
      - name: Decode release keystore
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/deen-day-release.keystore
          cat > android/keystore.properties <<EOF
          storeFile=deen-day-release.keystore
          storePassword=${{ secrets.KEYSTORE_PASSWORD }}
          keyAlias=${{ secrets.KEY_ALIAS }}
          keyPassword=${{ secrets.KEY_PASSWORD }}
          EOF

      - name: Build release AAB
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        working-directory: android
        run: gradle :app:bundleRelease --no-daemon --stacktrace

      - name: Upload release AAB
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        uses: actions/upload-artifact@v4
        with:
          name: my-deen-release-aab
          path: android/app/build/outputs/bundle/release/app-release.aab
          if-no-files-found: error

      - name: Publish release
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        uses: softprops/action-gh-release@v2
        with:
          tag_name: release-build-${{ github.run_number }}
          name: My Deen release build ${{ github.run_number }}
          prerelease: false
          files: android/app/build/outputs/bundle/release/app-release.aab
```

## Keystore → secret (on his laptop, when it is on)
1. Muse sends `android/deen-day-release.keystore` as a private file; save it
   somewhere safe on the laptop and keep a backup copy.
2. In Git Bash on the laptop: `base64 -w0 android/deen-day-release.keystore`
   (one long line — that is the value for KEYSTORE_BASE64).
3. The other three values come from `android/keystore.properties`
   (storePassword → KEYSTORE_PASSWORD, keyAlias → KEY_ALIAS,
   keyPassword → KEY_PASSWORD). Those live only in the workspace; Muse reads
   the NAMES, never shows the values in chat.
4. Repo → Settings → Secrets and variables → Actions → New repository secret,
   add the four secrets.
5. Trigger the workflow (Actions → Build My Deen APK → Run workflow), then
   verify the AAB: valid zip, contains the Fix #19 app.js + 4 MP3s + 6
   notification icons, signed with the RELEASE keystore (signer SHA must match
   the release keystore, NOT any debug signer), versionCode 1 / versionName 1.0.

## After the AAB — Play Console (user, from his own Google account)
- $25 one-time developer account; app name, short + long description,
  screenshots, feature graphic, 512×512 icon (exists: icons/icon-512.png),
  category, content-rating questionnaire, data-safety form (no data collected),
  privacy-policy URL (GitHub Pages link above).
- Note: the release-signed APK/AAB installs only over a build signed with the
  SAME keystore — the old debug builds must be uninstalled first (settings
  are wiped by uninstall; permissions must be granted again).
