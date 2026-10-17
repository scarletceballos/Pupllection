# Web Development Project 5 - *Pupllection*

Submitted by: **Scarlet Ceballos**

This web app: **Pupllection is a dashboard focusing on every dog breed and sub-breed from the Dog CEO API. Users can search and filter the collection, view a random photo of each breed, save favorites, and get surprised with a random breed.**

Time spent: **12** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] **The site has a dashboard displaying a list of data fetched using an API call**
  - The dashboard displays more than 10 unique items, one per row (165 breed and sub-breed entries, shown 12 at a time with a "Show more breeds" button)
  - The dashboard includes at least two features in each row: a random photo, the breed name, its family, its type (standalone breed or sub-breed), and how many varieties are in its family
- [x] **`useEffect` React hook and `async`/`await` are used**
  - `useEffect` + `async`/`await` fetch the breed list (`/breeds/list/all`) in `App`, and each row fetches its own random photo (`/breed/.../images/random`) the same way
- [x] **The app dashboard includes at least three summary statistics about the data**
  - The app dashboard includes four summary statistics about the data:
    - **Breed families**: the number of top-level breeds (108)
    - **Sub-breeds**: the number of varieties inside a breed (99)
    - **Largest family**: the family with the most varieties (Terrier, 25)
    - **Showing now**: how many entries match the current search and filters
- [x] **A search bar allows the user to search for an item in the fetched data**
  - The search bar filters by breed name and only displays matching rows
  - The list updates as the user types
- [x] **An additional filter allows the user to restrict displayed items by specified categories**
  - The **Family** dropdown filters by breed family (a different attribute than the name search)
  - Only rows in the chosen family are shown, and the list updates as the dropdown changes

The following **optional** features are implemented:

- [x] Multiple filters can be applied simultaneously
  - Search, family, type, family-size bounds, and favorites-only all combine together
- [x] Filters use different input types
  - Text input (search), dropdowns (family and sort), radio buttons (type), number inputs (bounds), and a checkbox (favorites only)
- [x] The user can enter specific bounds for filter values
  - "Varieties in family" accepts a minimum and a maximum, so the user can ask for, say, families with between 5 and 10 varieties

The following **additional** features are implemented:

* [x] Each row has a Save button that hearts a breed. Favorites are stored in `localStorage`, survive a page refresh, and can be shown on their own with the "Favorites only" checkbox (which also shows the saved count).
* [x]  A button picks a random breed from the loaded data, clears every other filter, and shows that breed so the user can discover one they wouldn't have searched for.
* [x] Fetches another random photo for just that breed.
* [x] Sorting A to Z or Z to A, plus a Reset button that clears every filter at once.
* [x] Friendly loading, error, and empty states, including a "Try Again" button if the API can't be reached.

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='pupllection/assets/dogpreview.gif' title='Video Walkthrough' width='850' alt='Video Walkthrough' />

GIF created with [N-Studio](https://nicke.tech/n-studio) for Windows

## Notes

Challenges that came up while building the app:

- Every breed row needs its own photo request, so loading all 165 at once would fire 165 network calls. I show 12 rows at a time with a "Show more breeds" button and use `loading="lazy"` on images.
- Both the breed fetch and each row's photo fetch can finish after the component has changed or unmounted. Each effect uses an `ignore` flag in its cleanup so a late response can't overwrite newer state or trigger a state update on a removed component.
- The breed list is nested (`hound: ["afghan", "basset", ...]`) while photo URLs are `/breed/hound/afghan/images/random`, and standalone breeds have no sub-breed segment. I flatten the nested data into one list of entries, each carrying its own API path, family, type, and family size.
- `localStorage` can be blocked or hold invalid data, so reading and writing are wrapped in `try`/`catch` and fall back to an empty list.

## License

    Copyright [2026] [Scarlet Ceballos]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
