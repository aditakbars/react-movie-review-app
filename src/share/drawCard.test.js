import { fileName, W, H } from './drawCard';

test('the card is Instagram Story size', () => {
    expect([W, H]).toEqual([1080, 1920]);
});

test('downloads get a readable file name', () => {
    expect(fileName({ title: 'Submarine', watched: '2026-06-15' })).toBe('adits-cinema-submarine-2026-06-15.png');
    expect(fileName({ title: 'The Hunger Games: The Ballad of Songbirds & Snakes', watched: '2026-09-26' }))
        .toBe('adits-cinema-the-hunger-games-the-ballad-of-songbirds-snakes-2026-09-26.png');
    expect(fileName({ title: 'WALL·E' })).toBe('adits-cinema-wall-e.png');
});
