---
name: Àmì
description: License videos from Nigerian creators. They get paid every time.
colors:
  blue: "#1d4ed8"
  blue-deep: "#1e40af"
  blue-wash: "#eaf0ff"
  ink: "#0f0f10"
  ink-soft: "#5c5c66"
  line: "#ececf0"
  wash: "#f5f6f8"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(46px, 6.6vw, 100px)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(34px, 4vw, 56px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  lede:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
rounded:
  card: "18px"
  media: "22px"
  frame: "28px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 5vw, 72px)"
  container: "1240px"
  section: "clamp(96px, 11vw, 160px)"
  stack: "28px"
  tile-gap: "18px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "#2a2a2e"
  button-on-media:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  nav-signup:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "42px"
    padding: "0 20px"
  clip-tile:
    backgroundColor: "#141518"
    textColor: "{colors.paper}"
    rounded: "{rounded.media}"
  licence-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "24px"
  step-number:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.blue}"
    rounded: "{rounded.pill}"
    size: "44px"
---

# Design System: Àmì

## Overview

**Creative North Star: "The Open Screen"**

Àmì is a white, open room where the videos do the talking. Every screen is mostly paper white and generous space, and the colour comes from the content itself: creators laughing, jollof steaming, aso-oke at an owambe. The interface stays quiet so the clips can be loud.

Each section says one thing. It gets one headline, at most one short line under it, and one action. Media is real photography or moving video, framed in large rounded rectangles that sit inset on the white page rather than bleeding edge to edge. Where text sits on media, a dark scrim keeps it readable, and the type gets big and confident rather than decorated.

The user rejected an earlier dense direction (many video rows, receipt-style licence widgets, monospace type, paragraphs of explanation) as having no hierarchy. Calm and image-led is the brief.

**Key Characteristics:**
- White page, generous section spacing, a centred 1240px container.
- Bricolage Grotesque headlines, Figtree for everything you read or click.
- Real photos and looping muted video as the main visual material.
- Ink-black pill buttons on white; white pill buttons on media.
- Blue appears only as small marks.

## Colors

A neutral paper-and-ink system with a single blue used sparingly; the photography supplies the colour.

### Primary
- **Àmì Blue** (#1d4ed8): the brand mark. The two accents of the Àmì wordmark, step numbers, check and verified badges, focus rings and text selection.
- **Deep Blue** (#1e40af): hover and pressed state for anything blue.
- **Blue Wash** (#eaf0ff): soft fill behind blue marks (step-number discs).

### Neutral
- **Ink** (#0f0f10): all headlines and body text on white, primary buttons, the Sign up pill.
- **Soft Ink** (#5c5c66): supporting lines, nav links at rest, footer text and secondary details.
- **Line** (#ececf0): the footer rule and hairline dividers.
- **Wash** (#f5f6f8): the quiet fill for inputs and empty media slots.
- **Paper** (#ffffff): the page, the licence card, popovers, and buttons that sit on media.

### Named Rules
**The Mark Rule.** Blue only ever appears as a small mark: a logo accent, a numbered disc, a badge, a focus ring. It never fills a section, a hero or a large button. If blue covers more than a thumbnail's worth of a screen, it is wrong.

**The Content Is The Colour Rule.** Backgrounds stay white or media. Don't add tinted panels or gradients to make a section feel colourful; pick a better photo or clip instead.

## Typography

**Display Font:** Bricolage Grotesque (with ui-sans-serif, system-ui)
**Body Font:** Figtree (with ui-sans-serif, system-ui)

**Character:** Bricolage is warm and slightly quirky at large sizes, which suits creator culture; set tight and heavy it reads like a bold caption. Figtree is plain, friendly and very legible for everything functional.

### Hierarchy
- **Display** (700, clamp(46px, 6.6vw, 100px), 0.94): the hero headline and the closing "Your work. Your mark. Your money." Always on media, always white, centred. 40px on phones.
- **Headline** (700, clamp(34px, 4vw, 56px), 1.02): one per section.
- **Title** (700, 20–24px, 1.1–1.25): step titles, clip tile names (23px desktop, 18px phone).
- **Body** (400, 17px, 1.55): general copy. Keep lines under about 40 characters for supporting lines and 65–75 for real paragraphs.
- **Lede** (400, 18px, 1.55, Soft Ink): the one line under a headline.
- **Label** (600, 15–16px): buttons, nav, text links.
- **Meta** (500, 12–14px, tabular figures): durations and small facts on tiles.

### Named Rules
**The One Headline Rule.** A section gets one headline and at most one supporting line. No labels or kickers above headlines, no second sub-heading.

## Layout

Content sits in a centred container of 1240px with fluid side gutters (20px on phones up to 72px). Sections are separated by large, consistent space (clamp(96px, 11vw, 160px)), with more space above a heading than below it.

Patterns in use:
- **Inset media frame:** hero and closing band are full-container-width rounded frames, inset from the page edge by the gutter, about 780px tall on desktop (82svh on phones).
- **Centred head + grid:** a centred headline and lede over a four-column tile grid (gap 18px), which becomes two columns on phones (gap 12px).
- **Split:** two equal columns, text against a 4:5 portrait image, alternating sides down the page; stacks on phones with the image after the text.

Breakpoint: 860px switches nav to the compact menu and grids to their phone layout.

## Elevation & Depth

Flat by default. Surfaces have no shadows at rest; depth appears only for things that float or respond.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 0 0 1px #e5e7eb, 0 12px 32px -16px rgb(15 15 16 / 0.22)`): the licence card and the search bar at rest.
- **Popover** (`box-shadow: 0 0 0 1px rgb(15 15 16 / 0.05), 0 18px 40px -12px rgb(15 15 16 / 0.3)`): dropdown menus.
- **Lift** (`box-shadow: 0 2px 4px rgb(15 15 16 / 0.08), 0 28px 48px -24px rgb(15 15 16 / 0.45)`): clip tiles on hover, together with a 6px rise.

### Named Rules
**The Flat-At-Rest Rule.** Nothing casts a shadow until it floats over media or responds to a pointer.

## Shapes

Soft, generous corners throughout, scaled to the size of the object: 16px for field boxes, 20px for popovers and Browse thumbnails, 22px for images and clip tiles, 24px for the player and licence card, 28px for the hero and closing frames (22px on phones), and full pills for every button, chip and search field. No hard corners and no borders on media.

## Components

### Buttons
- **Shape:** full pill (999px), 52px tall, 26px side padding; 42px tall in the nav.
- **Primary (on white):** Ink fill, white label. Hover goes to #2a2a2e.
- **On media:** white fill, Ink label; its partner is a transparent pill with a 1.5px white outline at 65% opacity.
- **Ghost (on white):** transparent with a 1.5px #d9d9e0 inner outline that darkens to Ink on hover.
- **Press:** 1px downward nudge. Focus: 2px blue ring offset 3px.

### Navigation
- Sticky, white at 90% with a light blur, 76px tall (64px on phones).
- Wordmark left, three links in Soft Ink (15px, 500) turning Ink on hover, then Log in and a Sign up pill on the right. On phones: wordmark, Sign up pill, menu icon.

### Hero media frame
- A rounded 28px frame holding a muted, looping, autoplaying video (poster image first), with a dark scrim of 50% plus a soft radial darkening behind the text.
- Display headline, one lede line and two buttons (on-media pair), centred.
- A small frosted pause button in the corner; people who prefer reduced motion get the poster, not the video.

### Clip tile (signature)
- 3:4 rounded tile (22px) showing a still from its clip, with a soft dark fade along the bottom.
- Bottom row: the name in Bricolage (23px, white) on the left, the duration as quiet text (14px, white at 78%) on the right, sharing a baseline.
- Hover or keyboard focus: the tile rises 6px with the Lift shadow and the clip plays muted on a loop, zooming slightly. On touch screens a tile plays while at least 75% visible. Long clips loop a short, on-subject window.
- No play buttons, progress bars or badges on the tile.

### Step list
- 44px blue-wash disc with a blue number, then a Title-size step name and one Soft Ink line. Three steps, 28px apart.

### Closing band
- A rounded 28px frame with a city photograph under a 50% scrim, the Display line "Your work. Your mark. Your money." centred in white, and one on-media button.

### Search bar (Browse)
- One white pill (64px tall, max 760px, centred): a search icon and one input, nothing else. A soft shadow at rest; a 2px Ink ring when focused. No filters or settings inside the bar.
- People can type a creator, a title, or describe the moment they want ("bride dancing at a wedding"); the placeholder rotates through example searches while the field is empty and still. A small clear button appears once there is text.
- On phones the bar is 56px tall with a shorter placeholder.
- Built so the back end can later swap the word matching for vector (semantic) search without changing the UI.

### Popover menu
- White, 24px corners, soft shadow, opening 12px below its trigger.
- Options are rows with a semibold name, one Soft Ink line explaining it, and a check on the selected row. Closes on outside click or Escape.

### Category rail
- A centred row of line icons (26px, 1.6 stroke) with 13px semibold labels underneath, sticky under the nav with a hairline below.
- Inactive items are Soft Ink; hover adds a light grey underline; the active item is Ink with a 2px Ink underline. Scrolls sideways on phones.

### Clip card (Browse)
- A 4:5 rounded (20px) thumbnail with the duration bottom-right. Hover lifts it and plays the muted preview.
- "New" badge for clips under a week old: a small blue pill (26px tall) top-left with just the word "New" in white, 12.5px semibold, with a soft blue glow. No icon: sparkle marks read as "AI" and were rejected.
- Two lines underneath with hierarchy from weight and colour only: the title (600, 16px, Ink, one line) and the creator (15px, Soft Ink, blue tick if verified). No price on the card; prices appear once a clip is opened.

### Video page
- Kept deliberately small: the title (Bricolage, up to 48px), one meta line (28px creator avatar, creator name in Ink, category, length), then the player and one-line description on the left and the licence calculator (400px, sticky) on the right. "More comedy" (four Browse cards) closes the page.
- **Player:** 16:9, 24px corners, plays muted on arrival. A small white "Àmì Preview" wordmark sits top-right as the watermark. Controls (play/pause, time, thin progress track, sound, full screen) appear on hover or when paused, as frosted 40px circles over a bottom fade; always shown on phones.
- **Licence calculator:** white, 24px corners, hairline ring and soft shadow. Top: the price in Bricolage 40px and one Soft Ink summary line ("Whole video · 1 month", "6 seconds · forever"). Then two questions, each a 14px semibold label over a segmented control:
  - "What do you need?" Whole video / Part of it. Choosing a part opens a trim window over a still of the clip: a 3px Ink frame with Ink grab handles, everything outside it washed white, a white playhead, and "0:04 – 0:10 · 6 seconds" underneath. Drag the handles or the window (arrow keys work too); the player loops just that part.
  - "How long?" 1 month / 3 months / 1 year / Forever.
  - Then one full-width Ink "Continue to payment" button. Nothing else on the card.
- **Segmented control:** Wash track (14px corners, 4px padding), 42px options in 14px semibold Soft Ink; the chosen one is Ink on a white pill that slides between options.
- **Phone:** the calculator sits after the player, and a white bar pinned to the bottom shows the price and summary with a "License" button; it hides while the calculator is on screen.

### Upload page
- Three calm steps on one page, never a long boxed form:
  1. **Drop:** the headline "Upload a video" (no line under it), then a large Wash drop area (28px corners, ~440px tall) with a white 72px circle holding an upload arrow, "Drag your video here", "MP4, up to 200 MB" and an Ink "Choose a file" button. Dragging over tints it Blue Wash with a 2px blue ring.
  2. **Details:** "Add the details" (no line under it). The video plays muted on a loop on the left (16:9, click to pause), with the file name, size and a "Replace" link under it. On the right, a single column: Title, Description (optional), Category, Your price, one rights checkbox, and a full-width Ink "Publish video" button.
  3. **Publishing, then live:** the clip on the left; on the right "Publishing your video" with an 8px Ink progress bar and the current stage, which becomes "Your video is live" with "View your video" and "Upload another".
- **Text fields:** 52px tall (textareas 104px), 14px corners, a 1px #d8dbe1 inner ring that darkens on hover and turns 2px Ink on focus. Labels are 15px semibold above the field; "(optional)" in Soft Ink.
- **Category picker:** the Browse category icons as a row of white tiles (icon over 13px label, 14px corners, 1px ring); the chosen tile gets a 2px Ink ring on Wash. Three per row on phones.
- **Price field:** a ₦ prefix inside the field, the amount semibold, formatted as you type; one Soft Ink help line under it.
- **Checkbox:** 24px, 7px corners, 1.5px ring; checked is Ink with a white tick, with the label beside it.
- **Errors:** nothing is disabled up front. On Publish, missing fields get a 2px #c2462a ring and a short line under them in #a33a1c ("Add a title.", "Pick a category.", "Tick this to confirm."), and the page scrolls to the first one.

### Detail rows
- Label on the left in Soft Ink, value on the right in semibold Ink, an optional second line under the value in Soft Ink, hairlines between rows. Used for licence details (Your licence, Check a licence).

### Status pill
- 32px pill with a small dot: Valid is green (#17663e on #e4f4ea), Expired is Soft Ink on Wash, errors are #a33a1c on #fbe9e4. The only place green is used.

### Tabs
- Underline tabs in the same language as the category rail: 16px semibold Soft Ink, active is Ink with a 2px Ink underline on a hairline. Used in My library.

### Other screens
- **Your licence:** the licensed part loops on the left; "Your licence is ready", detail rows (Video, Part, How long, Licence number, Paid) and two buttons, Download video (Ink) and View certificate (ghost).
- **Certificate:** one white sheet (max 820px, 24px corners on screen, none in print): logo, "Licence certificate", the number, a two-column fact list, then a real QR code to the public check page and the issue date. "Save as PDF" prints only the sheet.
- **Payment:** Àmì only shows the return from the bank: "Confirming your payment" with a thin sliding bar, or "Your payment didn't go through" with Try again and Back to the video. A one-line summary of what's being bought sits under the heading.
- **Check a licence:** a centred headline and a search-style bar that tidies input into AMI-XXXX-XXXX; the result is a white card with the number, a status pill, the clip, and detail rows. No prices or emails are ever shown.
- **My library:** "My library", one line of earnings ("₦39,100 earned from 6 licences"), an "Upload a video" button, then tabs: Videos (Browse cards with licences sold and earnings; a white "Hidden" badge on hidden videos), Sales (rows: clip still, title, buyer and date, part and duration, the creator's share), Bought (rows with Download and Certificate).
- **Log in / Sign up:** logo and a link to the other form at the top, a short form (email and password; name, email and password), a full-width Ink button and one line linking to the other form. A tall rounded creator video fills the right half; phones show the form only.

## Do's and Don'ts

### Do:
- **Do** give every section one headline, one short line and one action.
- **Do** use real photography or looping muted video of Nigerian creators and culture as the main visual material.
- **Do** put a dark scrim (about 50%) under any text that sits on media.
- **Do** keep blue to small marks (The Mark Rule).
- **Do** respect reduced motion: show posters instead of playing video.

### Don't:
- **Don't** fill the page with rows of video cards, receipt-style widgets or paragraphs of explanation; this was rejected as cluttered.
- **Don't** add play buttons, progress bars, "Preview" tags or other player chrome on top of clip tiles.
- **Don't** use monospace type for decoration, or labels and kickers above headlines.
- **Don't** use flat colour fields or gradients where a photo or clip belongs.
- **Don't** float info cards over images ("Tolu earned ₦42,500", "Licence valid…"); both were removed.
- **Don't** add copy, filters or settings nobody asked for; remove before adding.
- **Don't** use sparkle icons; they read as "AI".
