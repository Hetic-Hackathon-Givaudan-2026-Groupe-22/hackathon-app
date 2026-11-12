ALTER TABLE "tendances" ADD COLUMN "origine" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tendances" ADD COLUMN "pays" jsonb DEFAULT '[]'::jsonb NOT NULL;