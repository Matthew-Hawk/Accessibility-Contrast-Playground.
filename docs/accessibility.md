# Accessibility verification

Checked on October 15, 2026 in the Codex in-app Chromium browser on Windows.
This is a focused implementation audit, not a WCAG conformance certification.
No accessibility scanner or additional dependency was installed.

## Results

The rendered page has one header, main, footer, and level-one heading. There
are no skipped heading levels, duplicate IDs, unresolved `aria-labelledby` or
`aria-describedby` references, unlabeled app inputs, or positive tab indexes.
Results retain explicit list semantics even with bullets removed in CSS.

The app's own text and control-value contrast was measured from computed
foreground and inherited opaque background colors. All sampled default
records exceeded 7:1; the minimum was approximately 14.56:1. Failure badges
and the failure summary measured approximately 7.52:1. Error text and the
invalid-input suggestion note measured approximately 8.61:1. These focused
measurements exclude intentionally user-colored specimens, decorative glyphs,
native picker popups, pseudo-elements, and actual font rasterization; they
are not a general-purpose scanner.

The skip link becomes visible on keyboard focus and moves focus to `main`.
Forward and reverse keyboard navigation reached every app control without a
trap. Native pickers opened with Space and dismissed with Escape, returning
focus to the picker. Their popup controls are provided by the browser; the
hex inputs provide a separate keyboard route for choosing any supported color.

Visible focus was checked on links, text inputs, pickers, the swap button,
target select, radio group, suggestion action, and sample controls. App chrome
uses a blue outline on its fixed light surfaces. The selected-color sample
uses adjacent white and dark focus rings so its outline remains distinguishable
for arbitrary selected pairs. Hex fields use a minimum height rather than a
fixed height so larger text can expand the control.

At requested viewport widths of 320, 768, and 1440 pixels, the actual content
widths were 305, 753, and 1425 after scrollbar space. There was no horizontal
page overflow or overflowing input, select, button, or section. Narrow
layouts stack the workspace, suggestion controls, preview, and simulation
cards. This checks narrow-screen reflow, not browser text-only zoom.

## Keyboard checks to repeat

1. Tab to **Skip to content**, press Enter, and verify main receives focus.
2. Tab through foreground picker and hex value, swap, background picker and
   hex value, target, adjustment radios, and sample controls. Use Shift+Tab
   to return through the same controls and the header links.
3. Open a color picker with Space, then press Escape. Type three or six hex
   digits with or without `#`. An invalid draft must remain editable while
   retaining the previous valid preview and showing its described error.
4. Use native select keys to choose a target and arrow keys to change the
   adjustment radio. The verdict and target marker must agree with the select.
5. For #777777 on white, select AA normal text and foreground. Tab to **Apply
   suggestion** and press Enter. The result must be #767676, with white
   unchanged and focus returned to the foreground hex field.
6. For white on #777777, select AAA normal text and background. Applying
   #595959 must pass AAA and return focus to the background hex field.
7. For two #777777 colors and AAA normal text, the result must explicitly
   report no single-color solution. Applying best-effort black must still
   show a failure. Choosing the other color can then reach the target.
8. Tab to the sample button, activate it with Enter, and edit the sample
   input. Feedback must remain readable outside the selected-color sample.
   Changes and swaps must update previews without erasing sample input text.

All of these paths were exercised during the implementation phases. App
error regions are polite; the original-pair status is polite and atomic and
contains the pair, displayed ratio, and selected target's verdict. Screen-reader
markup and the browser accessibility tree were inspected. Actual spoken
announcements were not verified with a screen reader.

## Intentional preview exceptions

The live specimen's text and controls use the selected colors, including
failing pairs. A warning precedes it. Section titles, labels for the app's
color controls, ratios, hex values, suggestion explanations, and action
feedback retain the app's fixed colors. Simulation specimens are decorative
and hidden from the accessibility tree; card headings and numerical metadata
remain available. Badges always include an icon and Pass/Fail text.

## Remaining verification limits

- No NVDA, JAWS, or VoiceOver session was run; speech, verbosity, and browser
  combinations need testing with assistive-technology users.
- Safari, Firefox, mobile screen readers, OS high-contrast mode, and browser
  text-only zoom were not exercised.
- Reduced-motion rules were reviewed in the stylesheet; an OS preference
  toggle was not exercised. The app has no continuous animations or transitions.
- Native select and color-picker popup appearance and accessibility depend on
  the browser and OS. The audit only claims keyboard opening/dismissal for the
  current browser, not the accessibility of every internal popup control.

Color ratios evaluate opaque sRGB pairs, not entire-page conformance. Color
vision simulations are approximations, not medical diagnoses or individual
vision predictions. See the main README for the mathematical limitations.
