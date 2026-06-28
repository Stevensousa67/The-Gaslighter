CREATE TABLE "burns" (
	"id" text PRIMARY KEY NOT NULL,
	"user_message" text NOT NULL,
	"ai_response" text NOT NULL,
	"persona" text DEFAULT 'academic' NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "burns_votes_idx" ON "burns" USING btree ("votes");