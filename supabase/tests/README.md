# Database Stress Test Suite

Comprehensive tests to verify the 10,000 Hours database architecture is production-ready and scales to 1M+ users.

## Test Files

### 1. `01-data-integrity-tests.sql`
**Purpose:** Verify data correctness and constraint enforcement

**Tests:**
- Seeded data migration verification (110 sessions)
- Vote increment/decrement triggers
- Save increment/decrement triggers
- Completion increment triggers
- Duplicate vote prevention (compound PK)
- Negative count prevention (GREATEST(0, n-1))
- Cascade delete behavior
- Intent tags array integrity
- NOT NULL constraint enforcement
- CHECK constraint enforcement (enums)

**Expected Results:** All tests PASS

---

### 2. `02-scale-stress-tests.sql`
**Purpose:** Test performance under load

**Tests:**
- 10,000 simultaneous votes on single template
- Feed query performance (<100ms)
- Intent tag filter performance (<50ms)
- Concurrent vote consistency
- Multiple completions per user
- Index usage verification
- RPC function performance (<200ms)
- Aggregation query performance

**Expected Results:**
- All tests PASS
- Performance within thresholds
- 10K votes complete in <30 seconds

---

### 3. `03-architecture-review.sql`
**Purpose:** Audit database design for best practices

**Categories:**
- Index coverage
- Trigger configuration
- Constraint enforcement
- RLS security policies
- Data distribution analysis
- Storage projections
- Denormalization strategy
- Query pattern optimization
- Scale readiness checklist
- Recommendations for 1M+ users

**Expected Results:** No FAIL status, review WARN items

---

### 4. `04-data-flow-integration.sql`
**Purpose:** End-to-end user journey verification

**Scenarios:**
1. **Discovery Flow:** User fetches feed → votes → saves
2. **Completion Flow:** Plan meditation → complete → track
3. **Social Proof:** Multiple users → aggregate counts
4. **Intent Filtering:** Filter by anxiety/sleep tags
5. **Vote Toggle:** Vote → unvote → revote cycle
6. **Leaderboard:** Top content sorting
7. **User Stats:** Personal activity tracking

**Expected Results:** All scenarios PASS

---

## How to Run

### In Supabase SQL Editor:
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy entire contents of each test file
3. Paste and click "Run"
4. Review results in the output table

### Run Order:
1. `01-data-integrity-tests.sql` (must pass first)
2. `02-scale-stress-tests.sql` (generates test data)
3. `03-architecture-review.sql` (audit)
4. `04-data-flow-integration.sql` (e2e scenarios)

---

## Architecture Summary

### Denormalization Pattern (Reddit-style)
```
session_templates           session_template_votes
├── karma (denorm) ◄────── ON INSERT: karma++
├── saves (denorm) ◄────── ON DELETE: karma--
├── completions (denorm)   (triggers maintain consistency)
```

### Scale Characteristics

| Users | Votes Table | Completions Table | Est. Storage |
|-------|-------------|-------------------|--------------|
| 10K   | 500K rows   | 1M rows           | ~100MB       |
| 100K  | 5M rows     | 10M rows          | ~1GB         |
| 1M    | 50M rows    | 100M rows         | ~10GB        |

### Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Feed query (50 items) | <100ms | TBD |
| Vote insert + trigger | <50ms | TBD |
| Intent tag filter | <50ms | TBD |
| RPC with user context | <200ms | TBD |

---

## Key Design Decisions

### 1. Denormalized Counts
**Why:** O(1) read performance. Never COUNT(*) on page load.
**Trade-off:** Triggers add ~5ms to writes.

### 2. Compound Primary Keys on Votes/Saves
**Why:** Prevents double-voting without extra queries.
**Pattern:** `PRIMARY KEY (template_id, user_id)`

### 3. Separate Completions Table
**Why:** Users can complete same template multiple times.
**Pattern:** `id` as PK, allows duplicates on (template_id, user_id)

### 4. GIN Index on intent_tags
**Why:** Efficient array containment queries for filtering.
**Query:** `WHERE 'anxiety' = ANY(intent_tags)`

### 5. NULL user_id for System Content
**Why:** Distinguishes seeded content from user-generated.
**Benefit:** RLS policies naturally protect system content.

---

## Recommendations for 1M+ Scale

1. **Add composite index:** `(karma DESC, created_at DESC)` for feed sorting
2. **Implement caching:** Redis for top 100 templates (5-min TTL)
3. **Archive old completions:** Move >1 year to archive table
4. **Add rate limiting:** 100 votes/hour per user
5. **Monitor slow queries:** Alert on >100ms
6. **Consider read replicas:** Route feed reads to replica

---

## Monitoring Queries

### Check trigger health:
```sql
SELECT * FROM pg_stat_user_functions
WHERE funcname LIKE '%template%';
```

### Check index usage:
```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename LIKE 'session_template%';
```

### Check table sizes:
```sql
SELECT relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE relname LIKE 'session_template%';
```
