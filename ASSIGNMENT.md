# Take-home: the Transactions page

Thanks for doing this. Picture your first week on the fictional Acme Wallet web team.

Build the **Transactions page** from the Figma design link attached to your invitation.
Figma is the visual source of truth; use its desktop, mobile, details, states and filter-options frames.

The navbar and the
dashboard's "See all" link already point to `/transactions`, which is currently a 404. Your job is to
ship it.

## What "done" means

1. It matches the design at desktop and at 375px, including the loading, empty, error and details states.
   Follow the frames and annotations in the attached Figma design. The mock API supplies the live content;
   sample names, dates, balances and transaction counts in Figma are illustrative.
2. Search, filters, pagination and transaction details work as expected. Refreshing, sharing a link and
   pressing Back preserve the user's place and selections.
3. It works against the API as it really behaves, including when it's slow or failing. See [API.md](./API.md).

The attached Figma design and these requirements define the task. Implementation choices are yours.
The page has to be built on existing shared code, and not all of it is in good shape. How you handle that is
part of what we review. You own this codebase now.

## Time

We expect this task to take **no more than 2 hours**. We don't score volume, and a smaller, well-reasoned
PR beats a big one. List any unfinished work in your PR. You have until the deadline in your
invitation email; spend the time whenever suits you.

## How to submit

1. **Clone** the [starter repo](https://github.com/Cardtonic-Technologies/sfe).
2. Create a new **public** repo on your own GitHub account and push `main` to it **unchanged**:
   ```bash
   git clone https://github.com/Cardtonic-Technologies/sfe.git && cd sfe
   git remote set-url origin <your public repo URL>
   git push -u origin main
   git switch -c transactions-page
   ```
3. Work on that branch and open a **pull request against `main`** in your public repo. Fill in the PR
   template. Don't open anything against the original repo.
4. Commit the way you would at work. We read the history.
5. CI (lint, type check, formatting check, tests, build) runs on your PR through GitHub Actions.
6. Email us the PR link before the deadline. Please don't push after sending it.

## Ground rules

- **AI tools are fine.** Use them the way you would at work. Only submit code you understand and would
  defend.
- **Libraries:** use what you'd use at work, and say why in the PR.
- **Don't change the mock API** (`app/api/**`, `lib/mock/**`).
- **Questions:** email us. Making a reasonable assumption and writing it down in the PR is also fine.
