# Supabase snippets — numbered, in run order

Your migrations aren't CLI migrations. They're saved snippets in the SQL editor,
run by hand. That's a legitimate way to work, and this folder now matches it: the
filenames are the snippet names, and the number is the order they must run in.

I was previously giving you advice for a workflow you don't use — `supabase db push`,
timestamp prefixes, sorting. Ignore all of that. It doesn't apply here.

But your workflow has one property that matters enormously, and it's what bit you:

> **Snippets have no order and no history.** Nothing records which one ran, or when,
> or in what sequence. Any snippet can be re-run at any moment and silently rewrite
> whatever it defines. There is no log to check afterwards.

That is survivable **only if each database object has exactly one owner.** Yours had
two owners for `submit_application`. That's what this folder fixes.

---

## What to do right now

### 1. DELETE two snippets — in Supabase *and* in your files

```
DELETE  "FIX APPLICATION STATUS"   (fix_application_submission.sql)
DELETE  "MEDICAL FORM"             (medical_form_path.sql)
```

Both are folded into `04_submit_application.sql`. Nothing is lost by deleting them.

Delete them — don't just resolve not to run them. `FIX APPLICATION STATUS` is one
word away from `CHECK APPLICATION STATUS`, the snippet you were adding when this
broke. Leaving a loaded footgun next to a near-identically-named safe one and
relying on never misclicking is not a plan.

### 2. RUN snippet 04

Paste `04_submit_application.sql` and run it. It prints two columns; both must
read `t`:

```
 function_is_correct | backfill_complete
---------------------+-------------------
 t                   | t
```

That fixes new submissions **and** recovers the medical forms already lost.

### 3. RUN snippet 05 — if you haven't already

You already have a `CHECK APPLICATION STATUS` snippet, so this is probably done.
Re-running it is harmless (idempotent).

### Do NOT re-run 01, 02 or 03

They're already applied and they are **not** idempotent — `01_core_schema.sql` uses
bare `CREATE TABLE` / `CREATE TYPE` and will error on an existing database. They're
here so the set is complete and a fresh database can be rebuilt from scratch, not
because you need to touch them.

---

## The set

| # | File | Snippet name | Idempotent? | Owns |
|---|------|--------------|-------------|------|
| 01 | `01_core_schema.sql` | CORE SCHEMA | ✗ no | roles, `has_role`, news, events, media, applications |
| 02 | `02_contact_messages.sql` | CONTACT MESSAGES | ✗ no | contact_messages |
| 03 | `03_storage_policies.sql` | STORAGE POLICIES | ✗ no | storage.objects policies |
| 04 | `04_submit_application.sql` | SUBMIT APPLICATION | ✓ **yes** | `medical_form_path` column, **`submit_application`** |
| 05 | `05_check_application_status.sql` | CHECK APPLICATION STATUS | ✓ **yes** | `check_application_status` |

01–03 are your files, byte-for-byte unchanged. 04 is new and replaces two. 05 is
what you already have.

**Exactly one row of that table owns `submit_application`.** That's the whole point.

---

## Verified on a real PostgreSQL

Not reasoned about — actually run:

1. **Fresh database, 01→05 in order** — all five clean. As far as I can tell that's
   the first time this set has been provably runnable start to finish.
2. **Submit with a medical form** → `medical_form_path` populated.
3. **`check_application_status`** → returns the right row.
4. **Disaster replay** — re-ran your `FIX APPLICATION STATUS` on the healthy
   database. The next submission lost its medical form immediately. Already-stored
   rows were untouched, which is exactly why this was invisible: it only silently
   damages *new* applications.
5. **Heal** — ran 04. Function correct, and the lost path recovered out of `message`.
6. **Idempotency / safety** — 04 run repeatedly: never overwrites a good value,
   leaves genuinely document-less rows `NULL` rather than `''`.

---

## Ask the database, not the files

Your file tree was correct this whole time. `medical_form_path.sql` sat there with
the right 14-column INSERT while the database ran the 13-column version. Reading the
files told you nothing.

```sql
-- Which version is actually deployed?
SELECT obj_description('public.submit_application(jsonb)'::regprocedure);

-- Or, blunt:
SELECT prosrc LIKE '%medical_form_path%' AS medical_form_ok
FROM pg_proc WHERE proname = 'submit_application';
```

If `medical_form_ok` is ever `f`, something re-ran an old definition. Run 04 again.

## If you ever want CLI migrations

You don't need them, and I'm not recommending it as part of this fix. But if you
outgrow snippets, the thing you'd gain is exactly what's missing here: an applied-
migrations ledger, so "what actually ran against this database" is a question with
an answer. That's a deliberate project, not a rename — the files would need
timestamps in dependency order *and* the existing state reconciled into
`supabase_migrations.schema_migrations`, or the CLI will try to re-run everything.
