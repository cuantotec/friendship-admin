import { relations } from "drizzle-orm/relations";
import { artists, artworks, inquiries, events, eventRegistrations } from "./schema";

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

export const inquiriesRelations = relations(inquiries, ({one}) => ({
	artwork: one(artworks, {
		fields: [inquiries.artworkId],
		references: [artworks.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	event: one(events, {
		fields: [events.parentEventId],
		references: [events.id],
		relationName: "events_parentEventId_events_id"
	}),
	events: many(events, {
		relationName: "events_parentEventId_events_id"
	}),
	registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({one}) => ({
	event: one(events, {
		fields: [eventRegistrations.eventId],
		references: [events.id]
	}),
}));