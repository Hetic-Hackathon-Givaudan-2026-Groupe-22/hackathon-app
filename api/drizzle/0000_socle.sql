CREATE TABLE "analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"tendance_id" integer NOT NULL,
	"marche" text NOT NULL,
	"periode" text NOT NULL,
	"mode" text NOT NULL,
	"demarree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"duree_ms" integer NOT NULL,
	"chaine" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"analyse_id" integer NOT NULL,
	"tour" integer NOT NULL,
	"agent" text NOT NULL,
	"repond_a" integer,
	"relation" text,
	"contenu" text NOT NULL,
	"statut" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"titre" text NOT NULL,
	"editeur" text NOT NULL,
	"date" text NOT NULL,
	"url" text,
	"verifiee" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"famille" text NOT NULL,
	"statut" text NOT NULL,
	"date_debut" date NOT NULL,
	"description" text NOT NULL,
	"suivie" boolean DEFAULT false NOT NULL,
	"signaux" jsonb NOT NULL,
	CONSTRAINT "tendances_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "verdicts" (
	"id" serial PRIMARY KEY NOT NULL,
	"analyse_id" integer NOT NULL,
	"propose" text NOT NULL,
	"score" integer NOT NULL,
	"fiabilite" text NOT NULL,
	"explication_fiabilite" text NOT NULL,
	"raisons" jsonb NOT NULL,
	"reserve" text,
	"statut" text DEFAULT 'propose' NOT NULL,
	"final" text,
	"justification" text,
	"decide_par" text,
	"decide_le" timestamp with time zone,
	CONSTRAINT "verdicts_analyse_id_unique" UNIQUE("analyse_id")
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_tendance_id_tendances_id_fk" FOREIGN KEY ("tendance_id") REFERENCES "public"."tendances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_analyse_id_analyses_id_fk" FOREIGN KEY ("analyse_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verdicts" ADD CONSTRAINT "verdicts_analyse_id_analyses_id_fk" FOREIGN KEY ("analyse_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;