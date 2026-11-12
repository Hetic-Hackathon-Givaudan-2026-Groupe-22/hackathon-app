CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"expire_le" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilisateurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"nom" text NOT NULL,
	"mot_de_passe" text NOT NULL,
	"metier" text,
	"langue" text DEFAULT 'fr' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "utilisateurs_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;