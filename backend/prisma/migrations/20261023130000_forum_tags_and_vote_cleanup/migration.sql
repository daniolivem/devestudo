BEGIN;

-- Reply votes are now counted from ReplyVote, which records the voter.
-- The previous counter had no voter identity and cannot be migrated as individual votes.
ALTER TABLE "Reply" DROP COLUMN "votes";

-- Keep the selectable frontend technologies available from the categories API.
INSERT INTO "Category" ("id", "name")
VALUES
    (gen_random_uuid()::text, 'Python'),
    (gen_random_uuid()::text, 'React'),
    (gen_random_uuid()::text, 'Java'),
    (gen_random_uuid()::text, 'JavaScript'),
    (gen_random_uuid()::text, 'Node.js'),
    (gen_random_uuid()::text, 'TypeScript'),
    (gen_random_uuid()::text, 'Angular'),
    (gen_random_uuid()::text, 'Vue'),
    (gen_random_uuid()::text, 'PHP'),
    (gen_random_uuid()::text, 'Ruby'),
    (gen_random_uuid()::text, 'Go'),
    (gen_random_uuid()::text, 'Rust'),
    (gen_random_uuid()::text, 'PostgreSQL'),
    (gen_random_uuid()::text, 'Django')
ON CONFLICT ("name") DO NOTHING;

COMMIT;
