CREATE TABLE "suivis" (
	"utilisateur_id" integer NOT NULL,
	"tendance_id" integer NOT NULL,
	CONSTRAINT "suivis_utilisateur_id_tendance_id_pk" PRIMARY KEY("utilisateur_id","tendance_id")
);
--> statement-breakpoint
ALTER TABLE "suivis" ADD CONSTRAINT "suivis_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suivis" ADD CONSTRAINT "suivis_tendance_id_tendances_id_fk" FOREIGN KEY ("tendance_id") REFERENCES "public"."tendances"("id") ON DELETE cascade ON UPDATE no action;