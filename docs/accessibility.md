# Accessibility and Content Standards

## Purpose

This document defines practical accessibility and plain-language standards for the Board Game Recommender MVP.

These standards should guide implementation from the beginning rather than being added after the interface is complete.

The goal is to make the application usable for people who:

- navigate with a keyboard
- use screen readers or other assistive technology
- have difficulty with low contrast or colour-only information
- use mobile or smaller screens
- are unfamiliar with board-game terminology
- benefit from clear, simple instructions and predictable interactions

These standards apply to the landing page, questionnaire, review screen, recommendation results, explanations, loading states, errors and no-match states.

---

## MVP Accessibility Principles

The MVP will follow these principles:

1. Every interactive feature must be usable without a mouse.
2. Keyboard focus must always be visible.
3. Form controls must have clear labels and instructions.
4. Errors must explain what needs to be corrected in plain language.
5. Important information must never rely on colour alone.
6. Text and controls must have sufficient contrast.
7. The interface must remain usable on mobile and at increased text sizes.
8. Headings and page structure must follow a logical order.
9. Recommendation explanations must use plain language rather than unexplained board-game jargon.
10. Accessibility should be checked during development, not only at the end.

---

## Keyboard Navigation and Focus

All interactive parts of the MVP must be usable with a keyboard.

Users must be able to:

- move forward through interactive elements using `Tab`
- move backward using `Shift + Tab`
- activate buttons and links using standard keyboard controls
- select questionnaire options without requiring a mouse
- reach all important content and actions in a logical order

Keyboard focus must always be visible.

The interface must not remove the browser's focus indicator unless it is replaced with another clear focus style.

Focus order should follow the visual and reading order of the page.

When the questionnaire moves between steps, focus should move to a sensible location, such as the new question heading or first interactive control.

No keyboard trap is allowed. A user must always be able to move away from a control using normal keyboard navigation.

Any custom interactive component must provide the same keyboard behaviour that users would expect from an equivalent standard HTML control.

### Acceptance checks

During development:

- complete the full questionnaire using only the keyboard
- confirm every button, link and selectable option can be reached
- confirm the current focus position is always visible
- confirm focus order is logical
- confirm no component traps keyboard focus

---

## Form Labels, Instructions and Errors

Every form control must have a clear label that explains what the user is being asked to provide.

Labels must:

- be visible
- use plain language
- be programmatically associated with the related form control
- remain understandable without relying on placeholder text

Placeholder text should not be used as the only label.

Questionnaire instructions should be short and placed close to the relevant control.

If a question needs extra explanation, the wording should explain the choice in simple terms rather than using unexplained board-game terminology.

For example:

```text
How complex do you want the game to feel?
```

is clearer than:

```text
Select desired BGG weight.
```

Errors must explain what went wrong and what the user needs to do next.

Error messages should:

- appear close to the relevant field or question
- use plain language
- describe how to fix the problem
- remain visible until the problem is corrected
- not rely on colour alone
- be available to assistive technology

A generic message such as:

```text
Invalid input
```

should be avoided when a more useful message can be shown.

A better example is:

```text
Enter the number of people who will be playing.
```

If submission fails because of a wider application or network problem, the interface should explain that the problem is not with the user's questionnaire answers and provide a clear next action, such as trying again.

### Acceptance checks

During development:

- confirm every form control has a visible label
- confirm labels are correctly connected to controls
- confirm placeholder text is not used as the only instruction
- trigger validation errors deliberately and check that the message explains how to fix the problem
- confirm errors can be identified without relying on colour
- confirm screen-reader users can be notified about important validation errors

---

## Colour, Contrast and Non-Colour Cues

Colour may be used to support meaning, but important information must not rely on colour alone.

For example, recommendation strength should not be communicated only with colours such as green, amber or red.

If colour is used, it should be supported by text such as:

```text
Excellent match
Strong match
Good match
```

Validation errors should also use more than colour alone.

An error may use red styling, but it must also include:

- clear error text
- an icon or other visual cue where useful
- programmatic information that assistive technology can identify

Text and interactive controls must have sufficient contrast against their backgrounds.

The MVP should aim to meet WCAG 2.2 AA contrast requirements.

As a practical minimum:

- normal text should have a contrast ratio of at least `4.5:1`
- large text should have a contrast ratio of at least `3:1`
- important interface components and focus indicators should remain clearly visible against surrounding colours

Links must be identifiable as interactive.

Colour alone should not be the only way to distinguish a link from surrounding text.

The interface should remain understandable if viewed in greyscale.

### Acceptance checks

During development:

- check text and background contrast using an accessibility testing tool
- confirm recommendation strength can be understood without colour
- confirm errors remain understandable without colour
- confirm focus indicators remain visible
- check the interface in greyscale or using a colour-vision simulation tool

---

## Responsive Layout and Text Resizing

The MVP must remain usable on mobile devices, smaller screens and when users increase text size.

The interface should:

- adapt to different screen widths without horizontal scrolling for normal content
- keep buttons and form controls large enough to use comfortably
- avoid placing important controls too close together
- allow questionnaire content to stack vertically on smaller screens
- keep text readable without requiring zoom
- avoid fixed heights that cause text to be cut off
- allow content to reflow when text size is increased
- preserve the logical reading and focus order across screen sizes

The questionnaire should remain easy to complete on a phone.

Recommendation cards should stack clearly on narrow screens rather than becoming cramped.

Long game titles, explanations and caveats must wrap rather than overflow their containers.

The MVP should remain usable when browser text size or zoom is increased substantially.

As a practical development check, the interface should still function at approximately `200%` browser zoom.

### Acceptance checks

During development:

- test the application at common mobile widths
- confirm there is no unnecessary horizontal scrolling
- complete the questionnaire on a narrow screen
- confirm recommendation cards remain readable when stacked
- increase browser zoom to approximately `200%`
- confirm text is not clipped or hidden
- confirm buttons and form controls remain usable
- confirm focus order still matches the visual order

---

## Plain-Language and Content Standards

The MVP should use clear, beginner-friendly language throughout the interface.

The application should assume that users may have little or no knowledge of board-game terminology.

Content should:

- use short, direct sentences
- explain unfamiliar terms when they are necessary
- prefer everyday language over specialist terminology
- avoid unexplained BoardGameGeek field names or technical labels
- keep questionnaire choices easy to compare
- describe recommendations in terms of the user's situation and preferences
- avoid exaggerated or overly certain claims
- keep caveats constructive and easy to understand

For example:

```text
How much strategy do you want?
```

is clearer than:

```text
Select your preferred complexity weight.
```

Similarly:

```text
Good for players who enjoy planning and building
```

is clearer than:

```text
Strong engine-building mechanic alignment
```

If a board-game term is useful, it should be explained in plain language.

For example:

```text
Cooperative — players work together rather than against each other.
```

Recommendation explanations should focus on why the game suits the user's answers.

They should not simply repeat metadata.

For example:

```text
A strong fit for 4 players and the strategic experience you selected.
```

is more useful than:

```text
Supports 1–5 players and has a complexity rating of 2.8.
```

Caveats should explain trade-offs without sounding alarming.

For example:

```text
This may take a little longer than the time you selected.
```

is preferable to:

```text
Time requirement exceeded.
```

### Acceptance checks

During development:

- review questionnaire wording for unexplained jargon
- confirm technical BGG field names are not shown to users
- confirm recommendation explanations describe actual user-relevant reasons
- confirm caveats use neutral, constructive language
- check that users can understand important choices without knowing board-game terminology

---

---

## Images and Dynamic Status Messages

Game images must have appropriate alternative-text behaviour.

If a game image communicates information that is not already available nearby, it should have short, useful alternative text.

If the game title is already presented directly beside the cover image and the image adds no extra information, the image may be treated as decorative so screen-reader users do not hear the same game title twice.

Missing game images must not prevent users from understanding or selecting a recommendation.

Important changes that happen without a full page reload must also be available to assistive technology.

Examples include:

- recommendation results becoming available
- validation summaries appearing
- loading completing
- a no-match result appearing
- an API or network error appearing

Where appropriate, these messages should use accessible status or alert behaviour so that screen-reader users are notified without having to search the page for the change.

Status messages should remain short and useful.

For example:

```text
5 recommendations found.
```

or:

```text
We couldn't load recommendations. Please try again.
```

### Acceptance checks

During development:

- confirm game images have appropriate alternative-text behaviour
- confirm missing images do not remove important information
- confirm important loading, result and error changes can be detected by assistive technology
- confirm status messages do not unnecessarily repeat large amounts of page content

---

## Accessibility Testing and Tools

Accessibility should be checked throughout development rather than left until the MVP is finished.

The project will use a combination of automated checks and manual testing.

Automated tools may identify common problems, but they do not replace manually using the interface.

### Development tools

The MVP should use:

- browser developer accessibility tools
- Lighthouse accessibility audits
- axe DevTools or an equivalent automated accessibility checker
- browser responsive-device testing
- a contrast checker when selecting interface colours

Automated accessibility warnings should be investigated rather than ignored without a documented reason.

### Manual checks

Important user flows should also be tested manually.

This includes:

- completing the full questionnaire using only the keyboard
- checking that focus is visible and follows a logical order
- deliberately triggering form validation errors
- confirming important information does not depend on colour
- testing at approximately `200%` browser zoom
- testing at mobile screen widths
- checking that headings follow a logical structure
- checking that buttons, links and form controls use appropriate semantic HTML
- reviewing questionnaire and recommendation wording for unexplained jargon
- checking loading, error and no-match states for clear status information

Where practical, key flows should also be checked using a screen reader or browser accessibility tree.

---

## Accessibility Definition of Done

A user-facing MVP feature should not be considered complete until its relevant accessibility requirements have been checked.

For the MVP, this means:

- the feature can be operated with a keyboard
- keyboard focus is visible
- controls have clear labels
- validation and application errors are understandable
- meaning does not rely on colour alone
- contrast is appropriate
- content remains usable on mobile and at increased zoom
- headings and interface structure are logical
- user-facing language is clear and beginner-friendly
- automated accessibility checks do not contain unexplained serious issues

Accessibility problems discovered during development should be treated as normal product defects and tracked alongside other bugs.

---

## Review Before MVP Release

Before the MVP is considered ready for deployment, complete one end-to-end accessibility review covering:

```text
Landing page
→ Questionnaire
→ Review answers
→ Submit recommendations
→ Results
→ Expanded recommendation explanation
→ BoardGameGeek link
```

The review should also deliberately test:

```text
Validation error
No-match result
Loading state
External-data/API error
Missing game image or metadata
```

Any significant accessibility problem found during this review should be fixed or documented before the MVP is treated as complete.