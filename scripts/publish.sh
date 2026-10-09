#!/bin/sh
# Publish a Stockfish.js release in one go:
#
#   [bump version] -> [update README release links] -> commit -> tag -> push
#   -> npm pack (the npm prepack script builds every engine flavor into bin/,
#      the postpack script removes bin/ again)
#   -> create the GitHub release for the new tag and attach the engines taken
#      out of the packed tarball
#   -> npm publish that same tarball
#
# Usage: scripts/publish.sh [--patch | --minor | --major | --set-version=X] [options]
#
#   (no argument)  publish the version currently in package.json
#   --patch        19.0.1 -> 19.0.2
#   --minor        19.0.1 -> 19.1.0
#   --major        19.0.1 -> 20.0.0 (also sets buildVersion to 20)
#   --set-version=19.0.5
#                  publish an exact version, no bump
#
# A two-part version such as 19.0 is treated as 19.0.0. The working tree must
# be clean when the script starts, so commit your real changes first; the
# release commit then contains only the version bump and the README link
# update. package.json "version" is the published npm version and the tag
# name; "buildVersion" is the Stockfish engine version used in the engine file
# names (stockfish-19-lite-single.js), and it is what the build produces.
#
# Because the engines are built by the npm prepack script, this script never
# calls build.js directly. It runs `npm pack`, then reads the engine files out
# of the tarball, so the binaries attached to the GitHub release are
# byte-for-byte the binaries that npm serves. The publish step uses
# --ignore-scripts so nothing is rebuilt between those two steps.
#
# Options:
#
#   -h, --help            show this help
#   --dry-run             run every check and print the plan, change nothing
#   --yes                 skip the confirmation prompt
#   --no-github           skip the GitHub release (npm only)
#   --no-npm              skip npm publish (GitHub only)
#   --skip-build          pack with the engines that are already in bin/
#                         (skips prepack; useful to retry a failed publish)
#   --smoke               require the lite single-threaded engine from the
#                         packed tarball and play a move before publishing
#   --attach-existing     the GitHub tag already has a release; upload the
#                         assets into it instead of failing
#   --notes=TEXT          extra release notes, appended to the release body
#   --notes-file=PATH     read the extra release notes from a file
#   --npm-tag=TAG         npm dist-tag to publish under (default: latest)
#   --remote=NAME         git remote to push to (default: origin)
#   --repo=OWNER/REPO     override the GitHub repository (default: from remote)
#   --api=URL             GitHub API base (default: https://api.github.com)
#   --token-file=PATH     GitHub token file (default: .github-token)
#   --tarball-out=PATH    keep the packed .tgz at this path (default: the
#                         tarball is deleted with the script's temp directory)
#
# The GitHub token (contents: repository write scope) is read from a file in
# the repo root, one token per line, mode 600, and it must be gitignored. The
# script refuses to run if the token file is not ignored, so it cannot be
# committed by accident. The GITHUB_TOKEN environment variable overrides the
# file. npm credentials must already be present (`npm whoami`), so run
# `npm login` first.
#
# Nothing is pushed, released, or published until you confirm.

set -eu

# This script lives in scripts/, but everything it touches (package.json,
# README.md, .git, the token file) lives in the repository root.
cd "$(dirname "$0")/.."

PROG="scripts/$(basename "$0")"
REMOTE="origin"
API="https://api.github.com"
TOKEN_FILE=".github-token"
TARBALL_OUT=""
REPO_OVERRIDE=""
NPM_TAG="latest"
BUMP=""
SET_VERSION=""
NOTES=""
NOTES_FILE=""
DO_GITHUB=1
DO_NPM=1
DRY_RUN=0
ASSUME_YES=0
SKIP_BUILD=0
SMOKE=0
ATTACH_EXISTING=0
STEP_HINT=""
RELEASE_ID=""
RELEASE_URL=""
TOKEN=""

usage() {
    sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
}

fail() {
    echo "error: $*" >&2
    if [ -n "$STEP_HINT" ]; then
        echo "" >&2
        echo "This script already completed:" >&2
        echo "  $STEP_HINT" >&2
        echo "See the 'To undo' section printed at the end of a successful run." >&2
    fi
    exit 1
}

# A preflight check for a step that may be switched off (login, token,
# compiler). In a dry run these are warnings, so the plan can still be shown
# on a machine that is not set up to publish.
probe() {
    if [ "$DRY_RUN" = 1 ]; then
        echo "warning: $* (dry run)" >&2
        return 0
    fi
    fail "$*"
}

# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------

while [ $# -gt 0 ]; do
    case "$1" in
        --patch|--minor|--major)
            BUMP="$(printf '%s' "$1" | cut -c 3-)"
            ;;
        --set-version=*)   SET_VERSION="${1#--set-version=}" ;;
        --notes=*)         NOTES="${1#--notes=}" ;;
        --notes-file=*)    NOTES_FILE="${1#--notes-file=}" ;;
        --npm-tag=*)       NPM_TAG="${1#--npm-tag=}" ;;
        --remote=*)        REMOTE="${1#--remote=}" ;;
        --repo=*)          REPO_OVERRIDE="${1#--repo=}" ;;
        --api=*)           API="${1#--api=}" ;;
        --token-file=*)    TOKEN_FILE="${1#--token-file=}" ;;
        --tarball-out=*)   TARBALL_OUT="${1#--tarball-out=}" ;;
        --dry-run)         DRY_RUN=1 ;;
        --yes|-y)          ASSUME_YES=1 ;;
        --no-github)       DO_GITHUB=0 ;;
        --no-npm)          DO_NPM=0 ;;
        --skip-build)      SKIP_BUILD=1 ;;
        --smoke)           SMOKE=1 ;;
        --attach-existing) ATTACH_EXISTING=1 ;;
        -h|--help)         usage; exit 0 ;;
        *)
            echo "usage: $PROG [--patch | --minor | --major | --set-version=X] [options]" >&2
            echo "       $PROG --help" >&2
            exit 1
            ;;
    esac
    shift
done

if [ -n "$BUMP" ] && [ -n "$SET_VERSION" ]; then
    fail "use either a bump flag or --set-version, not both"
fi
if [ "$DO_GITHUB" = 0 ] && [ "$DO_NPM" = 0 ]; then
    fail "--no-github and --no-npm together leave nothing to do"
fi

WORK="$(mktemp -d)"
TMP_RESP="$WORK/resp.json"
trap 'rm -rf "$WORK"' EXIT

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------

for tool in git curl jq npm node tar sed; do
    command -v "$tool" >/dev/null 2>&1 || fail "required command not found: $tool"
done

[ -f package.json ] || fail "no package.json in $(pwd)"

PKG_NAME="$(jq -r '.name // empty' package.json)"
VERSION="$(jq -r '.version // empty' package.json)"
BUILD_VERSION="$(jq -r '.buildVersion // empty' package.json)"

[ -n "$PKG_NAME" ] || fail "package.json has no name"
[ -n "$VERSION" ] || fail "package.json has no version"
[ -n "$BUILD_VERSION" ] || fail "package.json has no buildVersion"

case "$VERSION" in
    *[!0-9.]*) fail "invalid version in package.json: '$VERSION'" ;;
esac

# A tag points at a commit, so a dirty tree means uncommitted work would be
# missing from the release; and the release commit must contain only the
# version bump and the README link update.
if [ -n "$(git status --porcelain)" ]; then
    git status --short >&2
    fail "working tree is dirty; commit your changes first (this script counts as a change)"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = "HEAD" ]; then
    fail "HEAD is detached; check out a branch first"
fi

if [ -n "$SET_VERSION" ]; then
    case "$SET_VERSION" in
        *[!0-9.]*|"") fail "invalid --set-version: '$SET_VERSION'" ;;
    esac
fi

# --- Repository -----------------------------------------------------------

REPO="$REPO_OVERRIDE"
if [ -z "$REPO" ]; then
    REMOTE_URL="$(git remote get-url "$REMOTE" 2>/dev/null || true)"
    [ -n "$REMOTE_URL" ] || fail "git remote '$REMOTE' does not exist"
    REPO="$(printf '%s' "$REMOTE_URL" \
        | sed -E 's#^(git\+)?(git@|https://|ssh://)([^@]*@)?[^:/]+[:/]##; s#\.git$##')"
    case "$REPO" in
        */*) ;;
        *) fail "could not parse owner/repo from '$REMOTE_URL'; use --repo=OWNER/REPO" ;;
    esac
fi

# --- npm ------------------------------------------------------------------

NPM_LATEST="(skipped)"
if [ "$DO_NPM" = 1 ]; then
    if ! npm whoami >/dev/null 2>&1; then
        probe "not logged in to npm; run 'npm login' (registry: $(npm config get registry))"
    fi
    if npm view "$PKG_NAME@$VERSION" version >/dev/null 2>&1; then
        probe "$PKG_NAME@$VERSION is already published to npm"
    fi
    NPM_LATEST="$(npm view "$PKG_NAME" dist-tags.latest 2>/dev/null || echo unknown)"
    if ! jq -e '.files // [] | index("bin/")' package.json >/dev/null; then
        fail "package.json files does not include bin/, so the package contains no engines"
    fi
fi

# --- GitHub ---------------------------------------------------------------

if [ "$DO_GITHUB" = 1 ]; then
    TOKEN="${GITHUB_TOKEN:-}"
    if [ -z "$TOKEN" ]; then
        [ -f "$TOKEN_FILE" ] || probe "no $TOKEN_FILE (put a GitHub token with repo write scope in it, one line, chmod 600)"
        if [ -f "$TOKEN_FILE" ]; then
            TOKEN="$(head -n1 "$TOKEN_FILE" | tr -d '[:space:]')"
            [ -n "$TOKEN" ] || probe "$TOKEN_FILE is empty"
            if ! git check-ignore -q "$TOKEN_FILE"; then
                fail "$TOKEN_FILE is not gitignored; add it to .gitignore so it cannot be committed"
            fi
            PERMS="$(stat -c '%a' "$TOKEN_FILE" 2>/dev/null || echo 000)"
            case "$PERMS" in
                600|400) ;;
                *) echo "warning: $TOKEN_FILE is mode $PERMS; consider chmod 600" >&2 ;;
            esac
        fi
    fi
    if [ -n "$TOKEN" ]; then
        AUTH_CODE="$(curl -sS --connect-timeout 20 --max-time 60 \
            -H "Authorization: Bearer $TOKEN" \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            -o "$TMP_RESP" -w '%{http_code}' "$API/user" || echo 000)"
        if [ "$AUTH_CODE" != "200" ]; then
            probe "GitHub authentication failed (HTTP $AUTH_CODE)"
        else
            echo "GitHub token belongs to $(jq -r '.login // "?"' "$TMP_RESP")"
        fi
    fi
fi

# --- Building -------------------------------------------------------------

if [ "$SKIP_BUILD" = 1 ]; then
    if [ -z "$(ls -A bin 2>/dev/null)" ]; then
        probe "--skip-build needs a populated bin/ directory; run once without --skip-build"
    fi
else
    command -v emcc >/dev/null 2>&1 \
        || probe "emcc is not in PATH; the prepack script runs build.js --all --strict-em-check"
    if ! node -e 'require.resolve("terser")' >/dev/null 2>&1; then
        probe "terser is not installed; run 'npm install' (build.js minifies the JS output)"
    fi
fi

# ---------------------------------------------------------------------------
# Compute the version
# ---------------------------------------------------------------------------

NEW_BUILD_VERSION="$BUILD_VERSION"

if [ -n "$BUMP" ]; then
    MAJOR="$(printf '%s' "$VERSION" | cut -d. -f1)"
    MINOR="$(printf '%s' "$VERSION" | cut -d. -f2)"
    PATCH="$(printf '%s' "$VERSION" | cut -d. -f3)"
    DOTS="$(printf '%s' "$VERSION" | tr -cd '.')"
    if [ "${#DOTS}" -lt 1 ] || [ "${#DOTS}" -gt 2 ]; then
        fail "version must be MAJOR.MINOR or MAJOR.MINOR.PATCH, got '$VERSION'"
    fi
    [ -n "$PATCH" ] || PATCH=0
    case "$BUMP" in
        patch) PATCH=$((PATCH + 1)) ;;
        minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
        major)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            NEW_BUILD_VERSION="$MAJOR"
            ;;
    esac
    VERSION="$MAJOR.$MINOR.$PATCH"
elif [ -n "$SET_VERSION" ]; then
    VERSION="$SET_VERSION"
fi

TAG="v$VERSION"
ENGINE_PREFIX="stockfish-$BUILD_VERSION"

if [ "$NEW_BUILD_VERSION" != "$BUILD_VERSION" ]; then
    echo "buildVersion will change from $BUILD_VERSION to $NEW_BUILD_VERSION"
    echo "note: the engine files become stockfish-$NEW_BUILD_VERSION*.js, so the README flavor"
    echo "      table, the 'updated to Stockfish N' line, and src/ need a matching edit."
fi

# ---------------------------------------------------------------------------
# Plan
# ---------------------------------------------------------------------------

if [ "$DO_GITHUB" = 1 ] && git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
    if [ "$ATTACH_EXISTING" = 1 ]; then
        echo "note: tag $TAG exists locally; --attach-existing was given, so it will not be recreated"
    else
        fail "tag $TAG already exists locally"
    fi
fi
if [ "$DO_GITHUB" = 1 ] && git ls-remote --exit-code --tags "$REMOTE" "$TAG" >/dev/null 2>&1; then
    if [ "$ATTACH_EXISTING" = 1 ]; then
        echo "note: tag $TAG already exists on $REMOTE; --attach-existing was given"
    else
        fail "tag $TAG already exists on $REMOTE"
    fi
fi

REMOTE_BRANCH_REF="refs/remotes/$REMOTE/$BRANCH"
if git rev-parse -q --verify "$REMOTE_BRANCH_REF" >/dev/null; then
    BEHIND="$(git rev-list --count "HEAD..$REMOTE_BRANCH_REF")"
    if [ "$BEHIND" != "0" ]; then
        fail "HEAD is $BEHIND commit(s) behind $REMOTE/$BRANCH; pull or rebase first"
    fi
fi

echo ""
echo "Package:      $PKG_NAME"
echo "Version:      $VERSION (package.json has $(jq -r .version package.json), npm latest $NPM_LATEST)"
echo "Engine:       Stockfish $BUILD_VERSION (files named ${ENGINE_PREFIX}-*)"
echo "Tag:          $TAG"
echo "Repository:   $REPO ($REMOTE/$BRANCH)"
echo "GitHub:       $( [ "$DO_GITHUB" = 1 ] && echo yes || echo no)"
echo "npm publish:  $( [ "$DO_NPM" = 1 ] && echo "yes (dist-tag $NPM_TAG)" || echo no)"
echo "Build:        $( [ "$SKIP_BUILD" = 1 ] && echo "skipped, using the engines in bin/" || echo "npm pack runs prepack (full build, several minutes)")"
echo "Work dir:     $WORK"
echo ""

if [ "$DRY_RUN" = 1 ]; then
    echo "dry run: nothing was changed"
    exit 0
fi

if [ "$ASSUME_YES" != 1 ]; then
    if ! [ -r /dev/tty ]; then
        fail "no terminal for the confirmation prompt; pass --yes"
    fi
    printf 'Publish %s %s? Type "yes" to continue: ' "$PKG_NAME" "$TAG" > /dev/tty
    read -r REPLY < /dev/tty || fail "no answer"
    [ "$REPLY" = "yes" ] || fail "aborted by user"
fi

# ---------------------------------------------------------------------------
# 1. Version bump and README release links
# ---------------------------------------------------------------------------

echo "--- Writing version $VERSION"
npm version --no-git-tag-version --allow-same-version "$VERSION" >/dev/null
if [ "$NEW_BUILD_VERSION" != "$BUILD_VERSION" ]; then
    jq --arg bv "$NEW_BUILD_VERSION" '.buildVersion = $bv' package.json > "$WORK/package.json" \
        && mv "$WORK/package.json" package.json
fi

if [ -f README.md ]; then
    LINKS="$(grep -c 'releases/download/v' README.md || true)"
    sed -i -E "s#releases/download/v[0-9][0-9A-Za-z.+-]*/#releases/download/v${VERSION}/#g" README.md
    UPDATED="$(grep -c "releases/download/v${VERSION}/" README.md || true)"
    echo "--- README.md release links: $LINKS found, $UPDATED now point at $TAG"
    if [ "$LINKS" = "0" ]; then
        echo "warning: README.md has no release download links to update" >&2
    fi
fi

if [ -n "$(git status --porcelain)" ]; then
    git add package.json
    if [ -f README.md ]; then
        git add README.md
    fi
    git commit -m "Publish $VERSION" >/dev/null
    STEP_HINT="commit $(git rev-parse --short HEAD) (version bump and README links)"
    echo "--- Committed $(git rev-parse --short HEAD): Publish $VERSION"
else
    echo "--- Nothing to commit (version and links already at $VERSION)"
fi

# ---------------------------------------------------------------------------
# 2. Tag and push
# ---------------------------------------------------------------------------

if [ "$DO_GITHUB" = 1 ]; then
    PUSH_REFS="HEAD:refs/heads/$BRANCH"
    if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
        echo "--- Tag $TAG already exists, not recreating it (--attach-existing)"
    else
        echo "--- Tagging $TAG"
        git tag -a "$TAG" -m "$PKG_NAME $VERSION"
        PUSH_REFS="$PUSH_REFS $TAG"
    fi
    echo "--- Pushing to $REMOTE ($PUSH_REFS)"
    # shellcheck disable=SC2086
    git push "$REMOTE" $PUSH_REFS
    STEP_HINT="$STEP_HINT; tag $TAG and $BRANCH pushed to $REMOTE"
fi

# ---------------------------------------------------------------------------
# 3. Pack (prepack builds the engines, postpack removes bin/)
# ---------------------------------------------------------------------------

echo "--- Packing"
PACK_LOG="$WORK/npm-pack.log"
if [ "$SKIP_BUILD" = 1 ]; then
    npm pack --ignore-scripts --pack-destination "$WORK" > "$PACK_LOG" 2>&1 || fail "npm pack failed"
else
    npm pack --pack-destination "$WORK" > "$PACK_LOG" 2>&1 || fail "npm pack failed (the prepack script builds the engines; its output is above)"
fi
cat "$PACK_LOG"

# npm names the file <package>-<version>.tgz and prints it among the notices,
# so take it from the destination directory rather than from stdout.
TARBALL="$WORK/$PKG_NAME-$VERSION.tgz"
if [ ! -f "$TARBALL" ]; then
    TARBALL="$(ls -t "$WORK"/*.tgz 2>/dev/null | head -n1)"
fi
[ -n "$TARBALL" ] && [ -f "$TARBALL" ] || fail "npm pack did not produce a tarball"
echo "--- Packed $(basename "$TARBALL") ($(wc -c < "$TARBALL") bytes)"

tar -xzf "$TARBALL" -C "$WORK"
PKG_DIR="$WORK/package"
[ -d "$PKG_DIR/bin" ] || fail "the packed tarball has no bin/ directory"

echo "--- Engines in the tarball:"
for f in "$PKG_DIR"/bin/*; do
    printf '      %-32s %s bytes\n' "$(basename "$f")" "$(wc -c < "$f")"
done

# Every flavor ships a .js and a .wasm, except the ASM.js engine.
for flavor in "" "-single" "-lite" "-lite-single"; do
    for ext in js wasm; do
        if [ ! -f "$PKG_DIR/bin/${ENGINE_PREFIX}${flavor}.${ext}" ]; then
            fail "the packed tarball is missing ${ENGINE_PREFIX}${flavor}.${ext}"
        fi
    done
done
if [ ! -f "$PKG_DIR/bin/${ENGINE_PREFIX}-asm.js" ]; then
    echo "warning: ${ENGINE_PREFIX}-asm.js is not in the package" >&2
fi

ENGINE_JS="$PKG_DIR/bin/${ENGINE_PREFIX}-lite-single.js"

if [ "$SMOKE" = 1 ]; then
    echo "--- Smoke test (lite single-threaded engine from the tarball)"
    node -e '
        var p = require("path");
        var engine = require(p.resolve(process.argv[1]))();
        engine.listener = function (line) {
            if (/^bestmove /.test(line)) {
                console.log("smoke: " + line);
                engine.terminate();
                process.exit(0);
            }
        };
        setTimeout(function () {
            console.error("smoke: no bestmove within 60 seconds");
            process.exit(1);
        }, 60000);
        engine.processCommand("uci");
        engine.processCommand("setoption name Threads value 1");
        engine.processCommand("go depth 6");
    ' "$ENGINE_JS"
fi

# ---------------------------------------------------------------------------
# 4. GitHub release, with the engines attached
# ---------------------------------------------------------------------------

if [ "$DO_GITHUB" = 1 ]; then
    gh_api() {
        # gh_api METHOD URL [extra curl args...]
        METHOD="$1"
        URL="$2"
        shift 2
        curl -sS -X "$METHOD" --connect-timeout 20 --max-time 900 \
            -H "Authorization: Bearer $TOKEN" \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            -o "$TMP_RESP" -w '%{http_code}' "$@" "$URL"
    }

    if [ -n "$NOTES_FILE" ]; then
        [ -f "$NOTES_FILE" ] || fail "--notes-file not found: $NOTES_FILE"
        NOTES="$(cat "$NOTES_FILE")"
    fi

    ASSET_LIST=""
    for f in "$PKG_DIR"/bin/*; do
        ASSET_LIST="$ASSET_LIST
- $(basename "$f") ($(wc -c < "$f") bytes)"
    done

    RELEASE_BODY="Stockfish.js ${VERSION}, the Stockfish ${BUILD_VERSION} engine compiled to WebAssembly.

Install from npm: npm install ${PKG_NAME}@${VERSION}
Command line: npm install -g ${PKG_NAME} && ${PKG_NAME}

Files attached to this release:${ASSET_LIST}

See README.md for which engine to use."
    if [ -n "$NOTES" ]; then
        RELEASE_BODY="$RELEASE_BODY

$NOTES"
    fi

    echo "--- Creating the GitHub release for $TAG"
    RELEASE_JSON="$(jq -n \
        --arg tag_name "$TAG" \
        --arg target_commitish "$TAG" \
        --arg name "$PKG_NAME $VERSION" \
        --arg body "$RELEASE_BODY" \
        '{tag_name: $tag_name, target_commitish: $target_commitish, name: $name, body: $body, draft: false, prerelease: false}')"

    CODE="$(gh_api POST "$API/repos/$REPO/releases" -H "Content-Type: application/json" -d "$RELEASE_JSON")"
    if [ "$CODE" = "422" ] && [ "$ATTACH_EXISTING" = 1 ]; then
        echo "--- Release for $TAG already exists; reusing it"
        CODE="$(gh_api GET "$API/repos/$REPO/releases/tags/$TAG")"
    fi
    case "$CODE" in
        201|200) ;;
        *)
            cat "$TMP_RESP" >&2
            fail "creating the release failed with HTTP $CODE"
            ;;
    esac

    RELEASE_ID="$(jq -r '.id // empty' "$TMP_RESP")"
    RELEASE_URL="$(jq -r '.html_url // empty' "$TMP_RESP")"
    UPLOAD_URL="$(jq -r '.upload_url // empty' "$TMP_RESP" | sed 's#{.*##')"
    [ -n "$RELEASE_ID" ] || fail "no release id in the API response"
    echo "--- Release $RELEASE_ID: $RELEASE_URL"

    # Some forges accept the body on create and store an empty one, so set the
    # notes explicitly. A failure here is non-fatal.
    PATCH_CODE="$(gh_api PATCH "$API/repos/$REPO/releases/$RELEASE_ID" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg body "$RELEASE_BODY" '{body: $body}')")"
    if [ "$PATCH_CODE" != "200" ]; then
        echo "warning: could not set the release notes (HTTP $PATCH_CODE); the release itself is fine" >&2
    fi

    for f in "$PKG_DIR"/bin/*; do
        NAME="$(basename "$f")"
        echo "--- Uploading $NAME"
        UP_CODE="$(gh_api POST "$UPLOAD_URL?name=$NAME" \
            -H "Content-Type: application/octet-stream" \
            --data-binary "@$f")"
        if [ "$UP_CODE" != "201" ]; then
            cat "$TMP_RESP" >&2
            fail "uploading $NAME failed with HTTP $UP_CODE"
        fi
    done
    STEP_HINT="$STEP_HINT; release $RELEASE_URL with the engines attached"
fi

# ---------------------------------------------------------------------------
# 5. npm publish
# ---------------------------------------------------------------------------

if [ "$DO_NPM" = 1 ]; then
    echo "--- Publishing to npm (dist-tag $NPM_TAG)"
    if [ "$NPM_TAG" = "latest" ]; then
        npm publish "$TARBALL" --ignore-scripts
    else
        npm publish "$TARBALL" --ignore-scripts --tag "$NPM_TAG"
    fi
    STEP_HINT="$STEP_HINT; $PKG_NAME@$VERSION published to npm"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
echo "Done."
if [ "$DO_GITHUB" = 1 ]; then
    echo "  Tag:      $TAG (on $REMOTE)"
    echo "  Release:  $RELEASE_URL"
fi
if [ "$DO_NPM" = 1 ]; then
    echo "  npm:      https://www.npmjs.com/package/$PKG_NAME/v/$VERSION"
fi
echo "  Tarball:  $(basename "$TARBALL") ($(wc -c < "$TARBALL") bytes)"
if [ -n "$TARBALL_OUT" ]; then
    cp "$TARBALL" "$TARBALL_OUT"
    echo "            saved to $TARBALL_OUT"
else
    echo "            deleted with $WORK; use --tarball-out=PATH to keep it"
fi
echo ""
echo "To undo:"
if [ "$DO_GITHUB" = 1 ]; then
    echo "  git push $REMOTE --delete $TAG && git tag -d $TAG"
    if [ -n "$RELEASE_ID" ]; then
        echo "  curl -X DELETE -H \"Authorization: Bearer \$TOKEN\" $API/repos/$REPO/releases/$RELEASE_ID"
    fi
fi
echo "  git reset --hard HEAD^   # drops the Publish $VERSION commit, only if it is not pushed yet"
if [ "$DO_NPM" = 1 ]; then
    echo "  npm unpublish $PKG_NAME@$VERSION --force   # only within 72 hours of publishing"
fi
