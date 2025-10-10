import { relations } from "drizzle-orm/relations";
import { artists, artworks, events, payments, formSubmissions, formTemplates, inquiries } from "./schema";

export const artworksRelations = relations(artworks, ({one, many}) => ({
	artist: one(artists, {
		fields: [artworks.artistId],
		references: [artists.id]
	}),
	inquiries: many(inquiries),
}));

export const artistsRelations = relations(artists, ({many}) => ({
	artworks: many(artworks),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	event: one(events, {
		fields: [payments.eventId],
		references: [events.id]
	}),
	formSubmission: one(formSubmissions, {
		fields: [payments.submissionId],
		references: [formSubmissions.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	payments: many(payments),
	formSubmissions: many(formSubmissions),
	formTemplate: one(formTemplates, {
		fields: [events.formTemplateId],
		references: [formTemplates.id]
	}),
	event: one(events, {
		fields: [events.parentEventId],
		references: [events.id],
		relationName: "events_parentEventId_events_id"
	}),
	events: many(events, {
		relationName: "events_parentEventId_events_id"
	}),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({one, many}) => ({
	payments: many(payments),
	event: one(events, {
		fields: [formSubmissions.eventId],
		references: [events.id]
	}),
	formTemplate: one(formTemplates, {
		fields: [formSubmissions.templateId],
		references: [formTemplates.id]
	}),
}));

export const formTemplatesRelations = relations(formTemplates, ({many}) => ({
	formSubmissions: many(formSubmissions),
	events: many(events),
}));

export const inquiriesRelations = relations(inquiries, ({one}) => ({
	artwork: one(artworks, {
		fields: [inquiries.artworkId],
		references: [artworks.id]
	}),
}));