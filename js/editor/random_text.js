const random_text = [
    "Tomaten schneiden", "2/3 der Zwiebeln schneiden", "2/3 der Zwiebeln anbraten",
    "Mit Gewürzen 10min schmoren", "Chilibohnen unterrühren",
    "Chili auf Kartoffelspalten verteilen", "Mit Avocado &amp; Sour cream garnieren",
    "Ofen auf 180°C vorheizen", "Süßkartoffel in Spalten schneiden", "In Öl, Paprika &amp; Salz schwenken",
    "Avocado zerdrücken", "1/3 der Zwiebel schneiden", "Zitronensaft hinzufügen",
    "Mit Kreuzkümmel &amp; Salz würzen", "Mit Avocado &amp; Sour cream garnieren",
    "In Öl, Paprika &amp; Salz schwenken", "35min im Ofen backen", "Chili auf Kartoffelspalten verteilen",
    "Zwiebel schneiden", "Knoblauch pressen", "5 min in Butter anbraten", "Tomatenmark &amp; Chili hinzufügen",
    "Alles anbraten bis dunkel gebräunt", "Mit Vodka ablöschen", "Sahne &amp; Parmesan einrühren", "Mit Petersilie anrichten",
    "Wasser zum kochen bringen", "Nudeln kochen", "1/2 Tasse Pasta-Wasser einschöpfen", "Sahne &amp; Parmesan einrühren",
    "Nudeln kochen", "Nudeln kochen bis al dente", "Wasser abgießen", "Mit Petersilie anrichten"
];
export function get_random_text() {
    return random_text[Math.floor(Math.random() * random_text.length)];
}
//# sourceMappingURL=random_text.js.map