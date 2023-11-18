const fetch = require('node-fetch');

const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1';
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ODYxNGMxZTk0MTUzNjY1YWE1NTkyYjAwZTY4YzdhYyIsInN1YiI6IjY1NTIzMTMwMDgxNmM3MDExYTBhMjE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cnXIf6rWbtaoXs_DJNwjNEygXuFRNVZj9O7w74-GmwM'
    }
};

fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));