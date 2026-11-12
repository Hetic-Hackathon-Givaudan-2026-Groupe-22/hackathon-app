CREATE TABLE "plan_equipes" (
	"analyse_id" integer NOT NULL,
	"equipe" text NOT NULL,
	"ordre" integer NOT NULL,
	CONSTRAINT "plan_equipes_analyse_id_equipe_pk" PRIMARY KEY("analyse_id","equipe")
);
--> statement-breakpoint
ALTER TABLE "plan_equipes" ADD CONSTRAINT "plan_equipes_analyse_id_analyses_id_fk" FOREIGN KEY ("analyse_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;