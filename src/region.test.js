import { regionalRelease } from './region';

// A film as TMDb returns it with append_to_response=release_dates.
const film = {
    release_dates: {
        results: [
            { iso_3166_1: 'US', release_dates: [{ type: 3, certification: 'R', release_date: '1999-10-15T00:00:00.000Z' }] },
            { iso_3166_1: 'ID', release_dates: [
                { type: 4, certification: '', release_date: '2000-03-01T00:00:00.000Z' },
                { type: 3, certification: '17+', release_date: '1999-12-01T00:00:00.000Z' },
            ] },
        ],
    },
};

test('uses the Indonesian rating and cinema date in Indonesia mode', () => {
    expect(regionalRelease(film, 'ID')).toEqual({ cert: '17+', certRegion: 'ID', date: '1999-12-01' });
});

test('uses the US rating and date in US mode', () => {
    expect(regionalRelease(film, 'US')).toEqual({ cert: 'R', certRegion: 'US', date: '1999-10-15' });
});

test('falls back to the US rating, and says so, when Indonesia has none', () => {
    const noLocal = { release_dates: { results: [film.release_dates.results[0]] } };
    expect(regionalRelease(noLocal, 'ID')).toEqual({ cert: 'R', certRegion: 'US', date: null });
});

test('copes with a film that has no release data yet', () => {
    expect(regionalRelease(null, 'ID')).toEqual({ cert: null, certRegion: null, date: null });
});
