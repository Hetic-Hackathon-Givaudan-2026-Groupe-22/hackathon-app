ALTER TABLE "analyses" ADD COLUMN "periode_mois" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "comparaisons" jsonb DEFAULT '[]'::jsonb NOT NULL;