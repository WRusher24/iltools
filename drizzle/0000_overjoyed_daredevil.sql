CREATE TABLE "affiliate_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"destination_url" text NOT NULL,
	"network" text,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "affiliate_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "affiliate_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"network" text,
	"commission_model" text,
	"terms" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity" text,
	"entity_id" text,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"label_he" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "click_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_slug" text NOT NULL,
	"slot_id" text,
	"page" text,
	"referrer_host" text,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"session_hash" text
);
--> statement-breakpoint
CREATE TABLE "consent_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"anon_id" text NOT NULL,
	"categories" jsonb NOT NULL,
	"version" text NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_index" (
	"path" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"updated" date,
	"regulated" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"licence_number" text,
	"verified_on" date,
	"webhook_url" text,
	"lead_types" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"payload_json" jsonb NOT NULL,
	"consent_text_version" text NOT NULL,
	"consent_ts" timestamp with time zone NOT NULL,
	"partner_id" integer,
	"status" text DEFAULT 'queued' NOT NULL,
	"ip_hash" text,
	"ua_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"double_opt_in_token" text,
	"unsubscribe_token" text NOT NULL,
	"confirmed_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"consent_text_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "provider_fee_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"category" text NOT NULL,
	"rule" jsonb NOT NULL,
	"source_id" text
);
--> statement-breakpoint
CREATE TABLE "provider_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"category" text NOT NULL,
	"plan_id" text NOT NULL,
	"name_he" text,
	"price_monthly" numeric,
	"price_annually" numeric,
	"billing_cycle" text,
	"limits" jsonb,
	"source_id" text,
	"accessed_on" date
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" text NOT NULL,
	"category" text NOT NULL,
	"name_he" text NOT NULL,
	"name_en" text,
	"website" text,
	"informational_only" boolean DEFAULT false NOT NULL,
	"last_verified" date,
	"confidence" text,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rates_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tax_year" integer NOT NULL,
	"checksum" text NOT NULL,
	"data" jsonb NOT NULL,
	"loaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rates_versions_tax_year_unique" UNIQUE("tax_year")
);
--> statement-breakpoint
CREATE INDEX "click_events_provider_ts_idx" ON "click_events" USING btree ("provider_slug","ts");--> statement-breakpoint
CREATE INDEX "leads_created_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "provider_plans_provider_idx" ON "provider_plans" USING btree ("provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_id_category_uq" ON "providers" USING btree ("id","category");