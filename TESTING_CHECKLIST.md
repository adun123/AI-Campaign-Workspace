# Testing Checklist - Campaign Workspace

Testing checklist for Campaign Workspace page dan related features.

**Last Updated:** 2026-06-18  
**Tester:** _[Your Name]_  
**Status Legend:** ⬜ Pending | ✅ Pass | ❌ Fail | ⚠️ Blocked

---

## 1. Campaign Info Panel

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| CP-01 | Panel collapse by default | Enter workspace | Panel tertutup, hanya campaign name visible | P0 | ⬜ |
| CP-02 | Toggle expand panel | Click campaign name | Panel expand, show campaign details | P0 | ⬜ |
| CP-03 | Display campaign info | Panel expanded | Show: Objective, Audience, Tone, Channels, Launch Date | P1 | ⬜ |
| CP-04 | Chevron rotation | Click to expand/collapse | Chevron rotates 180° on expand, back on collapse | P2 | ⬜ |
| CP-05 | Empty fields handling | Campaign with missing fields | Only show fields that have values | P1 | ⬜ |

**Notes:**
- Campaign data taken from active campaign or selected campaign
- Panel styling: gradient background, rounded corners

---

## 2. Brand Kit Indicator

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| BK-01 | Display brand kit badge | Enter workspace | Show brand kit name with color swatches | P0 | ⬜ |
| BK-02 | Color swatches | Brand kit has colors | Display first 3 colors as circles | P1 | ⬜ |
| BK-03 | More than 3 colors | Brand kit has 5+ colors | Only show first 3 colors | P2 | ⬜ |
| BK-04 | No brand kit | Workspace tanpa brand kit | Badge tidak muncul | P0 | ⬜ |
| BK-05 | Brand kit positioning | View badge | Located next to campaign info, same row | P1 | ⬜ |

**Notes:**
- Brand kit auto-detected from workspace
- Colors displayed as small circles with border

---

## 3. Prompt Enhancement (Auto-Enhance)

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| PE-01 | Auto-enhance trigger | Type simple prompt & submit | Gemini enhances prompt before sending to Flux | P0 | ⬜ |
| PE-02 | Enhanced prompt display | Generation complete | Show "Enhanced prompt:" in AI message bubble | P0 | ⬜ |
| PE-03 | Brand context injection | With active brand kit | Enhanced prompt includes brand voice, colors, guardrails | P1 | ⬜ |
| PE-04 | Channel context injection | Select Instagram channel | Enhanced prompt mentions "Instagram" context | P1 | ⬜ |
| PE-05 | Prompt enhancement disabled | User provides detailed prompt (200+ chars) | Still enhance (or skip if too long) | P2 | ⬜ |
| PE-06 | Enhancement failure handling | Gemini quota exceeded | Fallback to original prompt, no error to user | P0 | ⬜ |

**Notes:**
- Backend function: `enhancePrompt()` in route.ts
- Uses Gemini API (free tier available)
- Enhanced prompt always returned in response

---

## 4. Copy Prompt Button

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| CO-01 | Button visibility | View AI message with enhanced prompt | Copy icon next to enhanced prompt text | P0 | ⬜ |
| CO-02 | Copy action | Click copy icon | Enhanced prompt copied to clipboard | P0 | ⬜ |
| CO-03 | Success feedback | After copy | Show "Copied!" indicator + toast | P1 | ⬜ |
| CO-04 | Tooltip | Hover copy icon | Show tooltip "Copy enhanced prompt" | P2 | ⬜ |
| CO-05 | No enhanced prompt | Regular text generation | Copy button not shown | P1 | ⬜ |

**Notes:**
- Only appears for enhanced prompts (not user messages or regular AI text)
- Uses navigator.clipboard API

---

## 5. Regenerate Button

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| RG-01 | Button visibility (before generation) | Empty workspace | Regenerate button NOT visible | P0 | ⬜ |
| RG-02 | Button visibility (after generation) | Complete one generation | Regenerate button appears near input | P0 | ⬜ |
| RG-03 | Regenerate action | Click regenerate button | Re-use last prompt, trigger new generation | P0 | ⬜ |
| RG-04 | Preserve parameters | Change mode/aspect ratio, regenerate | Use last prompt but current mode/ratio | P1 | ⬜ |
| RG-05 | Disabled during generation | While generating | Button disabled | P0 | ⬜ |
| RG-06 | Session persistence | Refresh page | Regenerate button state reset (lastPrompt not persisted) | P2 | ⬜ |

**Notes:**
- lastPrompt stored in local component state (not in Zustand)
- Button icon: Refresh/Reload symbol

---

## 6. Cost Estimator

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| CE-01 | Display location | View input area | Cost shown below or above input bar | P0 | ⬜ |
| CE-02 | Dynamic calculation (mode) | Toggle text-to-image ↔ image-to-image | Cost updates based on mode | P0 | ⬜ |
| CE-03 | Dynamic calculation (aspect ratio) | Change aspect ratio to 16:9 | Cost increases (higher resolution) | P1 | ⬜ |
| CE-04 | Cost values accuracy | Text-to-image mode | Shows ~$0.003 (Flux Schnell) | P0 | ⬜ |
| CE-05 | Cost values accuracy | Image-to-image mode | Shows ~$0.025 (Flux Dev) | P0 | ⬜ |
| CE-06 | Icon and label | View estimator | Dollar sign icon + clear label | P2 | ⬜ |

**Expected Cost Formula:**
```
text-to-image: $0.003 (Flux Schnell)
image-to-image: $0.025 (Flux Dev)
aspect ratio multiplier: 1.0x (square), 1.2x (16:9, 9:16)
```

---

## 7. Prompt Suggestions (Quick Templates)

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| PS-01 | Suggestions dropdown trigger | Click suggestions icon | Dropdown appears with templates | P0 | ⬜ |
| PS-02 | Template categories | View dropdown | Show categorized templates (e.g., "Product", "Marketing", "Social") | P1 | ⬜ |
| PS-03 | Template selection | Click a template | Template filled into input field | P0 | ⬜ |
| PS-04 | Dropdown close | Click outside or select | Dropdown closes | P1 | ⬜ |
| PS-05 | Template customization | View templates | Templates relevant to marketing/content creation | P1 | ⬜ |
| PS-06 | Multiple template clicks | Click multiple templates | Last selection wins (replaces, not append) | P2 | ⬜ |

**Notes:**
- Templates should be pre-defined prompts
- Consider: Product Photo, Marketing Banner, Social Media Post, etc.

---

## 8. Text Overlay Tools (Canvas)

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| TO-01 | Access overlay tool | Hover image → click Type icon (T) | Modal opens with canvas preview | P0 | ⬜ |
| TO-02 | Type text | Enter text in input | Text appears in preview on image | P0 | ⬜ |
| TO-03 | Font family selection | Change font dropdown | Preview updates with new font | P0 | ⬜ |
| TO-04 | Font size slider | Adjust slider | Text size changes in preview | P0 | ⬜ |
| TO-05 | Color picker - preset | Click color swatch | Text color changes | P0 | ⬜ |
| TO-06 | Color picker - custom | Use color picker input | Custom color applied to text | P1 | ⬜ |
| TO-07 | Position: Top | Click Top button | Text positioned at top of image | P0 | ⬜ |
| TO-08 | Position: Center | Click Center button | Text centered vertically/horizontally | P0 | ⬜ |
| TO-09 | Position: Bottom | Click Bottom button | Text positioned at bottom | P0 | ⬜ |
| TO-10 | Bold toggle | Click Bold button | Text weight changes (bold/normal) | P0 | ⬜ |
| TO-11 | Apply text | Click "Apply Text" | New image with text overlay appears as history item | P0 | ⬜ |
| TO-12 | Cancel modal | Click Cancel/X | Modal closes without changes | P1 | ⬜ |
| TO-13 | Shadow effect | View generated text | Text has shadow for readability | P1 | ⬜ |
| TO-14 | Large image handling | Apply text to 4K image | Canvas handles large image without crash | P0 | ⬜ |
| TO-15 | Cross-browser | Test in Chrome, Firefox, Safari | Works consistently across browsers | P1 | ⬜ |

**Canvas Configuration:**
- Default font: Arial
- Default size: 32px
- Default position: Bottom
- Default color: White
- Default weight: Bold

---

## 9. Image-to-Image with Flux Kontext Pro

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| II-01 | Toggle image-to-image mode | Click image-to-image button | Mode switches, upload area appears | P0 | ⬜ |
| II-02 | Upload reference image | Upload PNG/JPG | Image appears in upload area | P0 | ⬜ |
| II-03 | Generate with Flux Kontext | Submit image + prompt | Uses Flux Kontext Pro model | P0 | ⬜ |
| II-04 | Preserve original structure | Prompt: "Change to night scene" | Original image structure preserved, only scene changed | P0 | ⬜ |
| II-05 | Add text via AI | Prompt: "Add 'HELLO' text" | Text added without changing image | P0 | ⬜ |
| II-06 | Multiple generations | Generate 3x | Each uses Flux Kontext Pro consistently | P1 | ⬜ |
| II-07 | Cost tracking | Generate image-to-image | $0.04 charged (Flux Kontext Pro pricing) | P0 | ⬜ |
| II-08 | Error handling | Upload invalid format | Show clear error message | P0 | ⬜ |
| II-09 | Data URI handling | Upload from clipboard | Data URI processed correctly | P1 | ⬜ |
| II-10 | Remove uploaded image | Click X on uploaded image | Image removed, can upload new | P1 | ⬜ |
| II-11 | Upload 2 images | Upload 2 PNG/JPG files | Both images appear in upload area | P0 | ⬜ |
| II-12 | Upload 3+ images | Upload 3-5 PNG/JPG files | All images appear in upload area | P0 | ⬜ |
| II-13 | Combine 2 images | Upload 2 images + prompt "Merge these into one" | Uses Flux Kontext Multi, combines both images | P0 | ⬜ |
| II-14 | Combine 3 images | Upload 3 images + prompt "Create a composition" | Uses Flux Kontext Multi, blends all 3 images | P0 | ⬜ |
| II-15 | Multi-image cost display | Attach 3 images | Cost shows $0.12 (3 × $0.04) | P0 | ⬜ |
| II-16 | Multi-image model label | Attach 2+ images | UI shows "Flux Kontext Multi (N images)" | P1 | ⬜ |
| II-17 | Mixed valid/invalid images | Upload 2 valid + 1 invalid file | Warns about invalid file, processes valid ones | P1 | ⬜ |
| II-18 | Exceed max images | Try to upload 6+ images | Shows error toast about max 5 image limit | P0 | ⬜ |
| II-19 | Upload 5 images (max) | Upload 5 PNG/JPG files | All accepted, Attach shows "(5/5)" | P0 | ⬜ |
| II-20 | Attach button counter | Upload 3 images | Button text shows "Attach (3/5)" | P1 | ⬜ |
| II-21 | Combine 5 images | Upload 5 images + prompt "full composition" | All 5 blended into one output | P1 | ⬜ |

**Multi-Image Combination Details:**
- Model (single image): `fal-ai/flux-pro/kontext` ($0.04)
- Model (2-5 images): `fal-ai/flux-pro/kontext/multi` ($0.04 × N images)
- Max images: 5 per request
- Key feature: Combines multiple reference images into one composition
- Auto-routes: 1 image → single endpoint, 2+ images → multi endpoint

---

## 10. Prompt Enhancement Integration

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| PI-01 | Full flow | Simple prompt → generate → view result | See enhanced prompt in message, generation uses enhanced version | P0 | ⬜ |
| PI-02 | Copy after generation | Generate, then copy enhanced prompt | Copy full enhanced text (not original) | P0 | ⬜ |
| PI-03 | Regenerate with enhancement | Regenerate button | Re-run with same (already enhanced) prompt | P1 | ⬜ |
| PI-04 | Enhancement in image-to-image | Mode: image-to-image | Enhancement also applies to image mode prompts | P1 | ⬜ |

---

## 11. Trends Page → Workspace Integration

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| TR-01 | Pin trend as brief | Trends page → click trend | Trend pinned, "Trend Brief" shown in workspace header | P0 | ⬜ |
| TR-02 | Quick action: Generate Prompt | Click "Generate Prompt" | Enhanced prompt filled into workspace input | P0 | ⬜ |
| TR-03 | Quick action: Copy Hashtags | Click "Copy Hashtags" | Hashtags copied to clipboard (comma-separated) | P0 | ⬜ |
| TR-04 | Quick action: Caption | Click "Caption" | Caption-focused prompt filled into input | P0 | ⬜ |
| TR-05 | Quick action: Image | Click "Image" | Image-focused prompt filled into input | P0 | ⬜ |
| TR-06 | Remove trend brief | Click X next to trend | Trend brief removed | P1 | ⬜ |
| TR-07 | Trend context in enhancement | With trend, generate | Gemini considers trend in prompt enhancement | P2 | ⬜ |
| TR-08 | Copy hashtags format | Copy action | Format: "#tag1 #tag2 #tag3" (hashtag + space separated) | P1 | ⬜ |

**Trend Template Examples:**
- **Caption:** "Create a caption about [trend], include hashtags: [tags]"
- **Image:** "Generate an image for [trend title], style: visual, trending"
- **Generate Prompt:** "Create content for trend: [trend name], hashtags: [tags]"

---

## 12. Edit with Brush (Existing Feature)

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| EB-01 | Access edit modal | Hover image → click Edit icon | Edit modal opens with brush tool | P0 | ⬜ |
| EB-02 | Draw mask | Brush over image | Red highlight shows masked area | P0 | ⬜ |
| EB-03 | Eraser tool | Click eraser, brush over mask | Mask removed in those areas | P1 | ⬜ |
| EB-04 | Clear all mask | Click "Clear Mask" button | All mask removed | P1 | ⬜ |
| EB-05 | Submit edit | Provide instruction, click submit | Generates edited image using masked area as reference | P0 | ⬜ |
| EB-06 | Edit uses Flux Kontext | Submit edit | Uses Flux Kontext Pro (not Flux Dev) | P0 | ⬜ |
| EB-07 | Result in history | After edit | Edited image appears as new history item | P0 | ⬜ |
| EB-08 | Preserve original | Mask small area | Original image preserved, only masked area changed | P0 | ⬜ |

---

## 13. History & Asset Management

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| HA-01 | History visibility | Generate content | History section shows all generations | P0 | ⬜ |
| HA-02 | Delete history item | Click delete icon | Item removed from history | P1 | ⬜ |
| HA-03 | Save to library | Click save icon on generated image | Image saved to asset library | P0 | ⬜ |
| HA-04 | Download image | Click download icon | Image downloaded as PNG | P0 | ⬜ |
| HA-05 | Image detail view | Click on image | Modal shows full-size image with options | P1 | ⬜ |

---

## Test Scenarios (End-to-End)

### Scenario 1: Complete Workflow
1. Pin trend "Healthy Living Tips" in Trends page
2. Go to workspace → verify trend brief visible
3. Click "Generate Prompt" → verify prompt filled
4. Click send → verify enhanced prompt shown
5. Hover result → click Type icon
6. Add text overlay → verify new image with text
7. Save final image to library

**Expected:** All steps smooth, final image saved successfully.

### Scenario 2: Image-to-Image Flow
1. Select image-to-image mode
2. Upload reference image
3. Type: "Make it look like a sunset scene"
4. Submit
5. Verify Flux Kontext Pro used (check terminal logs)
6. Verify original image structure preserved

**Expected:** Image transformed, original composition maintained.

### Scenario 3: Error Handling
1. Generate with empty prompt
2. Generate without image in image-to-image mode
3. Upload invalid file format

**Expected:** Clear error messages, no crashes.

### Scenario 4: Cost Efficiency
1. Generate 10 text-to-image
2. Generate 5 image-to-image with Flux Kontext
3. Generate 5 with text overlay (free)

**Expected cost:**
- Text-to-image: 10 × $0.003 = $0.03
- Image-to-image: 5 × $0.04 = $0.20
- Text overlay: $0.00
- **Total: $0.23**

---

## Known Issues & Notes

1. **Gemini API quota**: Free tier has daily limit. Test PE-06 carefully.
2. **Canvas large images**: Test with images > 2000px to ensure no crash.
3. **Browser compatibility**: Text overlay uses HTML5 Canvas, test all major browsers.
4. **Flux Kontext Pro cost**: Higher cost ($0.04) vs Schnell ($0.003). Monitor usage.
5. **Session state**: Regenerate button state not persisted on refresh (by design).

---

## Testing Environment

- **Browser:** Chrome 136 (latest)
- **OS:** Windows 11
- **Network:** Stable connection
- **Device:** Desktop (primary), test mobile responsiveness separately

---

## Sign-off

| Tester | Date | Status |
|--------|------|--------|
| | | |

**Total Test Cases:** 62  
**Priority Distribution:** P0: 35, P1: 20, P2: 7
