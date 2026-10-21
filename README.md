# Web Development Project 5 - *Pupllection*

Submitted by: **Scarlet Ceballos**

This web app: **Pupllection is a dashboard focusing on every dog breed and sub-breed from the Dog CEO API. Users can search and filter the collection, view a random photo of each breed, save favorites, and get surprised with a random breed.**

Time spent: **11** hours spent in total


The following **required** functionality is completed:

- [x] **Clicking on an item in the list view displays more details about it**
  - Clicking on an item in the dashboard list navigates to a detail view for that item
  - Detail view includes extra information about the item not included in the dashboard view
  - The same sidebar is displayed in detail view as in dashboard view
  - *To ensure an accurate grade, your sidebar **must** be viewable when showing the details view in your recording.*
- [x] **Each detail view of an item has a direct, unique URL link to that item’s detail view page**
  -  *To ensure an accurate grade, the URL/address bar of your web browser **must** be viewable in your recording.*
- [x] **The app includes at least two unique charts developed using the fetched data that tell an interesting story**
  - At least two charts should be incorporated into the dashboard view of the site
  - Each chart should describe a different aspect of the dataset


The following **optional** features are implemented:

- [x] The site’s customized dashboard contains more content that explains what is interesting about the data
  - A "story in the data" section with an average-line annotation on the bar chart, a "What to notice" caption under each chart, and three insight cards
  - "Try these filters in the gallery" buttons that apply real filters (sub-breeds only, the largest family, big families, standalone breeds)
  - A separate About the data page explaining how the data is organized, how to read the charts, and what to be careful about
  - All numbers and wording are computed from the fetched data, not hard-coded
- [x] The site allows users to toggle between different data visualizations
  - Hide charts / Show charts button displays or hides the visualizations
  - Each chart also has its own toggle: Bars ↔ Pie for the first chart, and Split (donut) ↔ Sizes (bar chart) for the second


The following **additional** features are implemented:

* [x] **Click a chart to filter the list.** Clicking a bar in the "Where the sub-breeds live" chart filters the gallery to that breed family and scrolls down to it, which connects the story told by the charts to the breeds themselves.
* [x] **Recently viewed breeds in the sidebar.** The last 5 breeds you opened are listed in the sidebar on every page (most recent first, no duplicates), saved in the browser so they survive a refresh, with a Clear button.
* [x] Filters and search are kept when you open a breed and come back, instead of resetting.
* [x] A "Copy link" box on each detail page, plus family-member links and previous/next navigation between breeds.
* [x] Favorites carry over to the detail page, and the sidebar shows how many pups are saved.

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='pupllection/assets/dogpreviewpart2.gif' title='Video Walkthrough' width='850' alt='Video Walkthrough' />

GIF created with [N-Studio](https://nicke.tech/n-studio) for Windows

## Notes

Challenges that came up while building the app:
- Loading a photo for every breed meant 165 separate requests at once, so I showed 12 breeds at a time with a “Show more” button and lazy-loaded the images.
- Some API responses came back after I had already changed pages or filters, which could show the wrong data. I fixed this by adding a cleanup check in each effect so old responses get ignored.
- The breed list is nested (breeds with sub-breeds inside), but the photo URLs are built differently. I flattened everything into one list where each entry carries its own API path.
- localStorage can be blocked or hold bad data, so I wrapped reading and writing in try/catch and fell back to an empty favorites list instead of letting the app crash.


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
