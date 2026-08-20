# Blurry Images in Chrome — Responsive Images and GPU-Composited Containers

This document explains a common cause of blurry images in Chrome-based browsers when responsive images are displayed inside animated, transformed, or composited UI components.

The issue can occur in any React, Next.js, or similar web project where images are rendered at a different CSS size than their source dimensions and are placed inside elements affected by CSS transforms or animations.

## Overview

Images can appear sharp in one browser but blurry in another, particularly on high-DPR/Retina displays.

A common scenario looks like this:

* An image has a large source resolution, such as `1078px` wide.
* The image is actually displayed at a much smaller CSS width, such as `270px`.
* The image uses a responsive image system such as Next.js `<Image>` and `srcset`.
* The image is inside an animated or transformed container, such as a `framer-motion` element.
* The image is clipped by a container using `overflow-hidden` and rounded corners.

In this situation, two separate problems can contribute to poor image quality:

1. The browser receives an incorrect `sizes` hint and may select an inappropriate responsive image source.
2. The image may be rendered inside a GPU-composited layer created by CSS transforms or animations.

## Symptoms

Typical symptoms include:

* Images look noticeably blurry or pixelated in Chrome/Chromium.
* The same images may look sharper in Firefox or another browser.
* The problem is more noticeable on high-DPR displays.
* Increasing the source image resolution does not necessarily fix the problem.
* The image may become blurry after scrolling or animation.
* Removing the animation or transform may temporarily make the image sharp.

## Root Cause

### 1. Incorrect `sizes` attribute

The `sizes` attribute describes the **CSS width at which an image will actually be displayed**.

It should not normally contain the source image's intrinsic pixel width.

For example, this is incorrect when the image is displayed at approximately `270px`:

```tsx
<Image
  src={image}
  width={1078}
  height={1920}
  sizes="1078px"
/>
```

The source image may be 1078 pixels wide, but that does not mean the browser should assume the image will occupy 1078 CSS pixels.

The correct value should describe the rendered layout:

```tsx
<Image
  src={image}
  width={1078}
  height={1920}
  sizes="(max-width: 640px) 240px, (max-width: 1024px) 260px, 280px"
/>
```

The exact values should be based on the actual CSS layout of the component.

### Why this matters

Responsive image systems typically generate multiple image sources and expose them through `srcset`.

The browser uses information such as:

* `srcset`
* `sizes`
* viewport width
* device pixel ratio
* network conditions
* browser-specific image selection behavior

to decide which source to download.

If the `sizes` value is significantly larger than the actual rendered width, the browser is making its decision using incorrect layout information.

For example:

```text
Actual CSS width:       270px
Source image width:    1078px
Incorrect sizes:       1078px
```

The browser may therefore make a different source-selection decision than it would if it knew the image was actually only 270 CSS pixels wide.

The important rule is:

> **`sizes` should describe the rendered CSS size, not the source image's pixel dimensions.**

If the rendered size changes at different breakpoints, use a responsive `sizes` expression.

For example:

```tsx
sizes="(max-width: 640px) 240px, (max-width: 1024px) 260px, 280px"
```

The values should match the actual layout rather than being copied from the image metadata.

---

### 2. Images inside transformed or animated containers

The second issue is related to browser compositing.

Modern browsers can move elements affected by CSS transforms into separate GPU compositor layers.

For example:

```tsx
<motion.div style={{ y: scrollOffset }}>
  <Image ... />
</motion.div>
```

or:

```css
.element {
  transform: translateY(...);
}
```

This can happen with:

* Framer Motion animations
* CSS transforms
* parallax effects
* transitions
* scale animations
* `translate3d`
* animated scrolling effects
* other GPU-composited UI

Once an element is composited, the browser has to decide how and at what resolution to rasterize that layer.

The exact behavior is browser- and hardware-dependent.

Chrome/Chromium may sometimes rasterize a transformed layer at a resolution that results in visible softness, particularly when:

* the image is large
* the element is continuously animated
* the element is scaled
* the element is clipped
* the display has a high device pixel ratio
* the element contains detailed screenshots or text

Firefox may make different compositing and rasterization decisions, which can make the same implementation appear sharper.

This means that a browser difference does not necessarily indicate that the image itself is defective.

---

## The Fix

The most reliable approach is to address the image sizing problem first, then reduce unnecessary compositing issues.

### A. Set `sizes` according to the actual rendered width

Find every responsive image using a `sizes` value derived from the source image dimensions.

For example:

```tsx
// Before
sizes={`${image.width}px`}
```

Replace it with a value representing the actual layout:

```tsx
// After
sizes="(max-width: 640px) 240px, (max-width: 1024px) 260px, 280px"
```

If the component has different dimensions, calculate the values from its actual CSS breakpoints.

For example, if the image is:

```text
240px on mobile
320px on tablet
480px on desktop
```

then the corresponding `sizes` value should describe those dimensions:

```tsx
sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 480px"
```

Do not blindly reuse these numbers. Measure the actual rendered width of the image.

### B. Prioritize immediately visible images

If an image is visible immediately when the page loads, consider prioritizing it.

For example, for a carousel:

```tsx
<Image
  src={image.src}
  width={image.width}
  height={image.height}
  sizes="..."
  priority={index === 0}
/>
```

This is especially useful for:

* hero images
* the first carousel slide
* above-the-fold screenshots
* important product images
* immediately visible UI previews

Do not mark every image as `priority`.

Only prioritize images that are genuinely important to the initial viewport.

### C. Use containment for isolated visual components

For components that are intentionally isolated visual surfaces, such as:

* device mockups
* cards
* image frames
* animated previews
* screenshots inside rounded containers

CSS containment can help establish clearer rendering boundaries:

```tsx
<div
  className="relative overflow-hidden rounded-[24px]"
  style={{ contain: "layout paint" }}
>
  <Image ... />
</div>
```

`contain: layout paint` tells the browser that the element's layout and painting can be treated as an isolated boundary.

This can be useful when the component is also being animated or transformed.

However, containment should not be added blindly to every image. Test it in the context of the component because containment can affect layout and rendering behavior.

### D. Avoid unnecessary image rendering overrides

For normal photographic or UI images, leave:

```css
image-rendering: auto;
```

as the default unless there is a specific reason to override it.

For example:

```tsx
style={{ imageRendering: "auto" }}
```

can explicitly preserve normal image interpolation behavior.

Do not use:

```css
image-rendering: pixelated;
```

for normal screenshots, photographs, or UI images. That property is intended for special cases such as pixel art and can make normal images look worse.

---

## Recommended Debugging Process

When an image looks blurry in one browser but not another, do not immediately increase the source image resolution.

Work through the following process.

### 1. Inspect the actual rendered size

Use browser DevTools and inspect the image.

Check:

```text
Intrinsic image size
Rendered CSS size
Device pixel ratio
```

For example:

```text
Intrinsic: 1078 × 1920
Rendered:   270 × 480
DPR:        2
```

The browser ideally needs an appropriate source for roughly:

```text
270 × 2 = 540 physical pixels
```

The responsive image selection should therefore have enough resolution for the actual display density.

### 2. Inspect `sizes`

Check the generated `<img>` element.

Look for something like:

```html
sizes="1078px"
```

when the image is actually displayed at:

```text
270px
```

That is a strong indication that the `sizes` value is incorrect.

Change it to describe the real CSS layout.

### 3. Inspect `srcset`

Check which source the browser actually downloaded.

Compare the selected source against:

* rendered CSS width
* device pixel ratio
* available `srcset` widths

If the browser is downloading an unexpectedly small source, the image may simply not have enough pixels for the display density.

### 4. Temporarily remove transforms

Disable animations and transforms temporarily.

For example, replace:

```tsx
<motion.div style={{ y: offset }}>
```

with:

```tsx
<div>
```

If the image suddenly becomes sharp, the compositing/animation path is likely contributing to the problem.

This is an excellent diagnostic technique because it separates image-selection problems from rendering/compositing problems.

### 5. Check for scaling

Look for CSS such as:

```css
transform: scale(...);
```

or:

```tsx
<motion.div animate={{ scale: ... }}>
```

Scaling a raster image can make browser compositing artifacts much more visible.

Whenever possible, render the image close to its final display dimensions instead of heavily scaling a smaller or dynamically rasterized layer.

### 6. Test at different DPRs

Test on:

* DPR 1
* DPR 1.5
* DPR 2
* DPR 3

If the issue is only visible at high DPR, investigate responsive image selection and compositor rasterization more closely.

### 7. Test multiple browsers

Compare at least:

* Chrome/Chromium
* Firefox
* Safari when relevant

A browser-specific difference is useful diagnostic information. It does not automatically mean the browser with the blur is "wrong."

---

## General Example

Consider a screenshot component:

```tsx
<div className="w-[300px] overflow-hidden rounded-3xl">
  <Image
    src="/screenshot.png"
    width={1200}
    height={2400}
    sizes="1200px"
  />
</div>
```

The source image is 1200px wide, but the actual display width is only 300px.

The `sizes` value should describe the 300px layout:

```tsx
<div
  className="w-[300px] overflow-hidden rounded-3xl"
  style={{ contain: "layout paint" }}
>
  <Image
    src="/screenshot.png"
    width={1200}
    height={2400}
    sizes="300px"
  />
</div>
```

If the width changes responsively:

```tsx
sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
```

If the image is immediately visible:

```tsx
priority
```

can also be appropriate.

---

## Files Typically Affected

The exact files will vary between projects, but the changes are usually located in:

| Component                    | Typical change                           |
| ---------------------------- | ---------------------------------------- |
| Image component / carousel   | Correct the `sizes` attribute            |
| Hero or above-the-fold image | Consider `priority`                      |
| Animated image wrapper       | Investigate transforms and compositing   |
| Image frame / mockup         | Consider `contain: layout paint`         |
| Responsive layout component  | Verify actual CSS widths and breakpoints |

---

## Verification

After applying the changes:

1. Open the application in Chrome.
2. Test on a high-DPR display if available.
3. Inspect the image's rendered dimensions.
4. Verify that `sizes` matches the actual CSS width.
5. Check which `srcset` source was selected.
6. Scroll through the page and allow all animations to complete.
7. Test the image before, during, and after animation.
8. Temporarily disable transforms to determine whether compositing is involved.
9. Test at DPR 1 and DPR 2+ when possible.
10. Compare the result with Firefox and other supported browsers.
11. Confirm that the fix does not cause excessive image downloads.

## Prevention

When building responsive or animated image components:

* **Set `sizes` to the actual CSS display width**, not the source image width.
* **Use responsive `sizes` values** when the rendered width changes at breakpoints.
* **Inspect the generated `srcset`** when debugging image quality.
* **Prioritize only important above-the-fold images** rather than every image.
* **Avoid unnecessary transforms and scaling** on raster images.
* **Investigate GPU compositing** when an image becomes blurry only while or after animation.
* **Use CSS containment selectively** for isolated visual components where it improves rendering behavior.
* **Test high-DPR displays**, because rendering problems can be much more noticeable there.
* **Do not assume that a browser difference means the image itself is corrupted.** Different browsers can make different image-selection and compositing decisions.
* **Measure the actual rendered dimensions** instead of relying on the image's intrinsic dimensions.

## Key Takeaway

When a high-resolution image looks blurry in Chrome but sharp elsewhere, investigate **image selection and browser compositing separately**.

The first thing to verify is:

```text
Does `sizes` describe the actual CSS width of the image?
```

Then investigate:

```text
Is the image being transformed, animated, scaled, clipped, or GPU-composited?
```

Correcting the responsive image sizing is usually the first and most important step. If the image is still blurry after the correct source is being selected, investigate transforms, compositing, scaling, and containment.
