CREATE TABLE faq_items (
    id VARCHAR(36) PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0),
    published BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO faq_items (id, question, answer, position, published) VALUES
('faq-find-a-home', 'How do I find a room or flat?', 'Browse student homes in Sevilla and filter by neighborhood, maximum monthly rent, move-in date and home type. Open a listing to compare its price, availability, furnishings and amenities.', 0, TRUE),
('faq-renting-process', 'How does the renting process work?', 'Search for a room or flat, review its rent, availability and amenities, then contact the viverasmus team about the listing you’re interested in. The team can answer your questions and explain the next step. Move-in dates are generally 1 September or 1 February for stays of at least five months; July and August can be rented individually.', 1, TRUE),
('faq-apartment-inclusions', 'What’s included in an apartment?', 'Inclusions vary by home. Each listing shows whether the apartment is furnished, whether utilities are included, and which amenities it has. These can include Wi-Fi, air conditioning, heating, a washing machine, a dishwasher, a balcony or an elevator. Ask the team whether cleaning service is available for the apartment you’re considering.', 2, TRUE),
('faq-prices', 'Are the prices shown final?', 'The rent shown is approximate; the final price is confirmed after booking. Check the listing details and contact the team if you have a question about a home’s cost.', 3, TRUE),
('faq-listing-question', 'Can I ask about a specific listing?', 'Yes. Use the contact page and include the home or room you’re looking at, along with your question about rent, availability or amenities.', 4, TRUE),
('faq-sevilla', 'Can I get help learning about Sevilla?', 'Listings include the neighborhood and an approximate map location, so you can explore areas such as Centro, Triana, Nervión, Los Remedios and San Bernardo while you compare homes.', 5, TRUE);
