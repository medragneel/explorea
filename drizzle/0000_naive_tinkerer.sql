CREATE TABLE "circuits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"description" text NOT NULL,
	"prix" real NOT NULL,
	"duree" integer NOT NULL,
	"region" text NOT NULL,
	"image" text,
	"actif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"telephone" text NOT NULL,
	"email" text,
	"wilaya" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "departs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circuit_id" uuid,
	"date" timestamp NOT NULL,
	"places_max" integer NOT NULL,
	"places_restantes" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depart_id" uuid,
	"clerk_user_id" text NOT NULL,
	"nombre_personnes" integer NOT NULL,
	"statut" text DEFAULT 'en_attente',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "departs" ADD CONSTRAINT "departs_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_depart_id_departs_id_fk" FOREIGN KEY ("depart_id") REFERENCES "public"."departs"("id") ON DELETE no action ON UPDATE no action;