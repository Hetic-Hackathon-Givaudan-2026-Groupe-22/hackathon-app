CREATE TABLE "alertes" (
	"id" serial PRIMARY KEY NOT NULL,
	"analyse_id" integer NOT NULL,
	"canal" text NOT NULL,
	"destinataires" jsonb NOT NULL,
	"contenu" text NOT NULL,
	"envoyee_par" text NOT NULL,
	"envoyee_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_analyse_id_analyses_id_fk" FOREIGN KEY ("analyse_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;