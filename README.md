# Not Rape, By Law

A digital exhibit on the marital rape exception in Indian law.
Digital Exhibit assignment, OB-238 Creating, Managing and Leading Social Enterprises, IIM Calcutta.

## Files

```
index.html        the whole site (HTML, CSS and JS in one file)
assets/poster.jpg the exhibit poster
```

No build step, no dependencies, no framework. Fonts load from Google Fonts.
Open `index.html` in any browser to preview locally.

## Hosting it on GitHub Pages

1. Make a new repository on GitHub. A public one is fine, since nothing here is private.
2. Upload `index.html` and the `assets` folder to the root of the repository.
   The file must be named `index.html` and must sit at the root, not inside a subfolder.
3. Go to the repository's **Settings**, then **Pages** in the left sidebar.
4. Under **Source**, choose **Deploy from a branch**. Pick branch `main` and folder `/ (root)`. Save.
5. Wait about a minute. Your site appears at
   `https://<your-username>.github.io/<repository-name>/`

To update anything later, edit the file in the repository and commit. Pages redeploys on its own.

## Adding the next object

Each object is one `<div class="card">` block inside the `#archive` section.
To add Object 02, copy the Object 01 card and change five things:

1. The date and object number in `.card-no`
2. The object type in `.card-kind`
3. The `<h3>` title
4. The quote and citation inside `.obj`
5. The analysis paragraphs inside `.body`, and the reading in `.readtag`

Every piece of visible text exists twice, once with `data-lang="en"` and once with
`data-lang="hi"`. If you add an English block you must add the Hindi one too, or the
language toggle will show a gap.

When you publish Object 02, also update the counter near the top of the archive
(`Object 01 of 4 published`) and delete or replace the Object 02 preview card.

## Sources used

- Exception 2, Section 375, Indian Penal Code, 1860
- Exception 2, Section 63, Bharatiya Nyaya Sanhita, 2023
- Independent Thought v. Union of India (2017)
- RIT Foundation v. Union of India, Delhi High Court, 11 May 2022
- Justice J.S. Verma Committee report, 2013
- National Family Health Survey 5, Ministry of Health and Family Welfare
- bell hooks, "Understanding Patriarchy"
