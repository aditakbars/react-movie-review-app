# react-movie-review-app

This is a React web application that allows users to explore movies, read reviews, and discover detailed information about each movie.  The movie data is fetched from The Movie Database (TMDb) API.

## Introduction

The React Movie Review App is a web application built using React.js. It fetches movie data from The Movie Database (TMDb) API and provides information about currently playing movies, allows users to search for movies, read reviews, and explore details about each movie. 

## Features

- **Home Page:** Displays a list of currently playing movies and a Search Movie feature.
- **Movie Detail Page:** Provides detailed information about a selected movie.
- **Reviews Page:** Shows a list of my personal reviews for various movies.
- **Review Detail Page:** Displays a detailed view of a specific review.
- **About Page:** Contains information about the application and its purpose.

## Letterboxd diary

The Diary page, "Recently watched" and the star badges come from `public/letterboxd.json`.

- **Every day:** the GitHub Action `Letterboxd diary` reads the Letterboxd RSS feed, adds new logs and redeploys the site. To run it now, open the Actions tab, choose "Letterboxd diary" and click "Run workflow". It needs the repository secrets `TMDB_KEY`, `OMDB_KEY` and `FIREBASE_SERVICE_ACCOUNT`.
- **About once a month**, or after editing old reviews: export your data on Letterboxd (Settings → Data → Export your data), then run

  ```
  npm run letterboxd:import -- path/to/letterboxd-export.zip
  ```

  Commit and push `public/letterboxd.json`. The export updates every rating and review, and removes logs you deleted on Letterboxd. The zip itself is never copied into the project, and `profile.csv` (email etc.) is ignored.
- `npm run letterboxd` runs the daily feed update by hand.

## Development

- `npm start`: run the site locally (needs a `.env` with `REACT_APP_TMDB_KEY` and `REACT_APP_OMDB_KEY`)
- `npm test`: run the tests
- `npm run build`: production build
