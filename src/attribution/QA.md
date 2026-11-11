# Attribution — what to test

This covers how the marketing site remembers where a visitor came from, and how that shows up on forms and links.

Test on https://micro1-local.webflow.io

The page should be using the latest script: https://static-website.sahil-773.workers.dev/main.min.js

Start each test in a private window so an old visit does not affect the next one.

## How it should behave

A cookie banner asks the visitor about cookies. Two choices matter.

**Performance** controls whether the site remembers where the visitor came from.

**Marketing** controls the ad and marketing tools: Meta, LinkedIn, X, and HubSpot. They load only after Marketing is allowed. The page reloads when the visitor saves a choice, and those tools appear after that reload.

**Before the visitor allows Performance**

- The site does not save where they came from.
- If the link they opened already has campaign details (the `utm_` bits in the address) or a `ref`, those details are filled into the form, in both the “first visit” and “latest visit” fields.
- The same details are added to links on the page, including links to other micro1 pages and links into the product apps.
- The “referring site” field stays empty.
- If they leave without clicking one of those links, the campaign details are gone.

**After the visitor allows Performance**

- The site saves where they came from, for 90 days.
- The first visit is remembered and is not overwritten later.
- The latest visit updates when they arrive again with new campaign details, a new `ref`, or from a new outside website.
- Opening the site later with a plain link does not erase the saved campaign details. It only updates the page they are on now.
- Links into the product apps get the saved details, including the referring site. Links around the marketing site are left alone.
- On the staging site, product links are pointed at the staging apps (talent, intelligence, company, jobs, refer).

In the US and similar regions, these choices may already be allowed before anyone clicks the banner. In the EU and UK they stay off until the visitor accepts.

The form’s consent field should read:

- Both Performance and Marketing allowed: `All`
- Only Performance: `Essentials, Performance`
- Only Marketing: `Essentials, Marketing`
- Neither: `Essentials`

## What to check

Check the hidden form fields in the page inspector (Elements tab) or by typing a field name in the console. An empty value means that field is blank. Changing cookie choices should update the fields.

Ignore warnings about GSAP. Those are not part of this test.

## Tests

1. **First visit, nothing in the address.** Open the homepage and reject cookies. The site should not remember the visit. Campaign fields on the form stay blank. Meta, LinkedIn, X, and HubSpot do not load. The console says performance is off.

2. **Campaign link, cookies rejected.** Open the homepage with `?utm_source=qa&utm_medium=cpc&utm_campaign=spring&ref=partner` and reject cookies. The form’s first-visit and latest-visit fields both show qa, cpc, spring, and partner. Referring site stays blank. A link to another page on the site, and a link into a product app, pick up those same details. A link that already has its own source keeps that source.

3. **Allow all cookies.** Click Accept All. The page reloads. Afterward the visit is saved, the form matches what was saved, and the console says it is writing the saved visit. Meta, LinkedIn, X, and HubSpot are present after the reload.

4. **A second campaign does not replace the first.** Still allowed, open `?utm_source=second&utm_medium=email`. Latest source becomes second and medium becomes email. The old campaign is cleared. First source stays qa, and the first campaign stays spring. The latest page is this new address. The first page is still the original one.

5. **A plain visit keeps the last campaign.** Open the homepage with nothing in the address, still allowed. Latest source stays second. The latest page updates to the homepage.

6. **Arriving from another website.** From a site that is not micro1, open the staging site with nothing in the address, cookies allowed. Referring site shows that other website. Source is filled in from it. Coming from micro1 itself does not count.

7. **Only a ref.** Open `?ref=newsletter` with cookies allowed and no earlier campaign saved. Ref and source are both newsletter. Medium is inbound.

8. **Turn Performance off again.** Open Customize and switch Performance off, leaving Marketing as it was. The page reloads. The saved visit is gone. The form goes back to using only what is in the current address. Links on the site pick up those details again. Meta, LinkedIn, X, and HubSpot stay loaded only if Marketing is still allowed.

9. **Performance on, Marketing off.** In Customize, allow Performance and turn Marketing off. The page reloads. The visit is still saved. The consent field says `Essentials, Performance`. Meta, LinkedIn, X, and HubSpot do not load. The HubSpot id on the form stays empty. Submitting a form still works.

10. **Marketing on, Performance off.** In Customize, allow Marketing and turn Performance off. The page reloads. The visit is not saved. Meta, LinkedIn, X, and HubSpot do load. The form uses only what is in the current address.

11. **Jobs page.** Open `/experts`. The job list should show. If the page errors, the new script is not the one loaded.
