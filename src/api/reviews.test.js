import { readingTime, reviewForImdb, cachedReviews, cachedReview } from './reviews';

test('reading time is words / 200, never less than a minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('kata '.repeat(50))).toBe(1);
    expect(readingTime('kata '.repeat(1000))).toBe(5);
});

test('finds the review for a film by its IMDb id', () => {
    const list = [{ review_id: 1, imdb_id: 'tt0137523' }, { review_id: 2, imdb_id: null }];
    expect(reviewForImdb('tt0137523', list).review_id).toBe(1);
    expect(reviewForImdb('tt0000000', list)).toBeNull();
    expect(reviewForImdb('tt0137523', null)).toBeNull();
});

test('reads saved reviews back from the browser cache', () => {
    localStorage.setItem('adits-cinema-reviews-v1', JSON.stringify({ at: 1, data: [{ review_id: 7, review_title: 'Halo' }] }));
    expect(cachedReviews()).toHaveLength(1);
    expect(cachedReview('7').review_title).toBe('Halo');
    localStorage.setItem('adits-cinema-reviews-v1', 'not json');
    expect(cachedReviews()).toBeNull();
});
