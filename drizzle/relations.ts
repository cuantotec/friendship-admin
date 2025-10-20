import { relations } from "drizzle-orm/relations";
import { events, artists, artworks, inquiries, eventRegistrations } from "./schema";

export const eventsRelations = relations(events, ({many}) => ({
	eventRegistrations: many(eventRegistrations),
}));

export const artistsRelations = relations(artists, ({many}) => ({
	artworks: many(artworks),
}));

export const artworksRelations = relations(artworks, ({one, many}) => ({
	artist: one(artists, {
		fields: [artworks.artistId],
		references: [artists.id]
	}),
	inquiries: many(inquiries),
}));

export const inquiriesRelations = relations(inquiries, ({one}) => ({
	artwork: one(artworks, {
		fields: [inquiries.artworkId],
		references: [artworks.id]
	}),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({one}) => ({
	event: one(events, {
		fields: [eventRegistrations.eventId],
		references: [events.id]
	}),
}));