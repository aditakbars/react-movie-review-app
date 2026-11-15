import { indexByFilm, starText, starLabel } from './letterboxd';

test('stars read the way Letterboxd writes them', () => {
    expect(starText(3.5)).toBe('★★★½');
    expect(starText(5)).toBe('★★★★★');
    expect(starText(null)).toBe('');
    expect(starLabel(4)).toBe('4 out of 5 stars');
});

test('a film shows its current rating, its latest diary entry and how often it was logged', () => {
    const entries = [
        { id: 'b', tmdbId: 157336, title: 'Interstellar', watched: '2025-06-08', rating: 5 },
        { id: 'a', tmdbId: 157336, title: 'Interstellar', watched: '2023-07-01', rating: 4.5 },
    ];
    const ratings = [{ tmdbId: 157336, title: 'Interstellar', rating: 5 }, { tmdbId: 27205, title: 'Inception', rating: 4 }];
    const byFilm = indexByFilm(entries, ratings);
    expect(byFilm.get(157336)).toMatchObject({ id: 'b', logs: 2, rating: 5, entryRating: 5 });
    expect(byFilm.get(27205)).toMatchObject({ ratedOnly: true, rating: 4, logs: 0 });
    expect(byFilm.has(1)).toBe(false);
});
