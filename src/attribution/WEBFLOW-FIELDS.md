# Static attribution — Webflow form fields

Filled by `fillAttributionInputs()` after attribution boot.

## Last touch (CRM Source) — existing

| Class | Value |
|---|---|
| `.utm_source_input` | `last.utm_source` |
| `.utm_medium_input` | `last.utm_medium` |
| `.utm_campaign_input` | `last.utm_campaign` |
| `.utm_content_input` | `last.utm_content` |
| `.utm_term_input` | `last.utm_term` |
| `.ref_site_input` | `last.ref_site` |
| `.ref_input` | `last.ref` |
| `.first_page_name` | `first.page` |
| `.last_page_name` | `last.page` |
| `.current_page_name` | current URL |
| `.hutk_input` | HubSpot `hubspotutk` (polled) |
| `.input_cookie-consent` | DataGrail categories string |

## First touch — add on each convert form

| Class | Value |
|---|---|
| `.first_utm_source_input` | `first.utm_source` |
| `.first_utm_medium_input` | `first.utm_medium` |
| `.first_utm_campaign_input` | `first.utm_campaign` |
| `.first_utm_content_input` | `first.utm_content` |
| `.first_utm_term_input` | `first.utm_term` |
| `.first_ref_site_input` | `first.ref_site` (optional) |
| `.first_ref_input` | `first.ref` (optional) |

## Make / HubSpot

- **Source / Medium / Campaign** = last UTM fields (unchanged).
- Map first-touch inputs to these Contact properties (single-line text, group "Attribution"):

| Form class | HubSpot label | Internal name |
|---|---|---|
| `.first_utm_source_input` | Original UTM source | `original_utm_source` |
| `.first_utm_medium_input` | Original UTM medium | `original_utm_medium` |
| `.first_utm_campaign_input` | Original UTM campaign | `original_utm_campaign` |
| `.first_utm_content_input` | Original UTM content | `original_utm_content` |
| `.first_utm_term_input` | Original UTM term | `original_utm_term` |
| `.first_ref_site_input` | Original referring site | `original_ref_site` |
| `.first_ref_input` | Original ref | `original_ref` |
| `.first_page_name` | First page seen | `first_page_seen` |

- Confirm Make scenarios forward the new hidden fields. Write first-touch once; do not overwrite after it is set.
