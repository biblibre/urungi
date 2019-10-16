const { Client } = require('pg');

async function main () {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });
    await client.connect();

    await client.query('DROP TABLE IF EXISTS company');
    await client.query('CREATE TABLE company (company_id serial primary key, name varchar(255))');

    await client.query('DROP TABLE IF EXISTS country');
    await client.query('CREATE TABLE country (country_id serial primary key, name varchar(255))');

    await client.query('DROP TABLE IF EXISTS movie');
    await client.query('CREATE TABLE IF NOT EXISTS movie (movie_id serial primary key, company_id integer, country_id integer, release_date date, title varchar(255))');

    await client.query('DROP TABLE IF EXISTS genre');
    await client.query('CREATE TABLE genre (genre_id serial primary key, name varchar(50))');

    await client.query('DROP TABLE IF EXISTS movie_genre');
    await client.query('CREATE TABLE movie_genre (movie_id integer, genre_id integer, unique (movie_id, genre_id))');

    await client.query('DROP TABLE IF EXISTS person');
    await client.query('CREATE TABLE person (person_id serial primary key, firstname varchar(255), lastname varchar(255), date_of_birth date)');

    await client.query('DROP TABLE IF EXISTS movie_actor');
    await client.query('CREATE TABLE movie_actor (movie_id integer, person_id integer, unique (movie_id, person_id))');

    const companies = ['Warner Bros.', 'Sony Pictures Motion Picture Group', 'Walt Disney Studios', 'Universal Pictures', '20th Century Fox', 'Paramount Pictures', 'Lionsgate Films', 'The Weinstein Company', 'Metro-Goldwyn-Mayer Studios', 'DreamWorks Pictures'];
    const company_ids = [];
    for (const company of companies) {
        const res = await client.query('INSERT INTO company (name) VALUES ($1) RETURNING company_id', [company]);
        company_ids.push(res.rows[0].company_id);
    }

    const countries = ['United States', 'China', 'United Kingdom', 'France', 'India', 'Nigeria', 'Egypt', 'Iran', 'Japan', 'Korea'];
    const country_ids = [];
    for (const country of countries) {
        const res = await client.query('INSERT INTO country (name) VALUES ($1) RETURNING country_id', [country]);
        country_ids.push(res.rows[0].country_id);
    }

    const movie_ids = [];
    for (let i = 0; i < 1000; i++) {
        const res = await client.query('INSERT INTO movie (company_id, country_id, release_date, title) VALUES ($1, $2, $3, $4) RETURNING movie_id', [random_element(company_ids), random_element(country_ids), date(), title()]);
        movie_ids.push(res.rows[0].movie_id);
    }

    const genres = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Film Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Short Film', 'Sport', 'Superhero', 'Thriller', 'War', 'Western'];
    const genre_ids = [];
    for (const genre of genres) {
        const res = await client.query('INSERT INTO genre (name) VALUES ($1) RETURNING genre_id', [genre]);
        genre_ids.push(res.rows[0].genre_id);
    }

    for (const movie_id of movie_ids) {
        for (let i = 0; i < 3; i++) {
            await client.query('INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [movie_id, random_element(genre_ids)]);
        }
    }

    const person_ids = [];
    for (let i = 0; i < 100; i++) {
        const res = await client.query('INSERT INTO person (firstname, lastname, date_of_birth) VALUES ($1, $2, $3) RETURNING person_id', [first_name(), last_name(), date()]);
        person_ids.push(res.rows[0].person_id);
    }

    for (const movie_id of movie_ids) {
        for (let i = 0; i < 5; i++) {
            await client.query('INSERT INTO movie_actor (movie_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [movie_id, random_element(person_ids)]);
        }
    }

    await client.end();
}

function random_element (array) {
    const idx = Math.floor(Math.random() * array.length);
    return array[idx];
}

function first_name () {
    const first_names = ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan'];

    return random_element(first_names);
}

function last_name () {
    const last_names = ['Brown', 'Smith', 'Patel (Gujrati/India)', 'Jones', 'Williams', 'Johnson', 'Taylor', 'Thomas', 'Roberts', 'Khan', 'Lewis', 'Jackson', 'Clarke', 'James', 'Phillips', 'Wilson', 'Ali', 'Mason', 'Mitchell', 'Rose'];

    return random_element(last_names);
}

function date () {
    const start = new Date(1950, 0, 1);
    const end = new Date();

    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function title () {
    const words = ['lorem', 'donec', 'non', 'est', 'nibh', 'nulla', 'tincidunt', 'posuere', 'nulla', 'id', 'bibendum', 'felis', 'sed', 'finibus', 'bibendum', 'massa', 'vestibulum', 'donec', 'eget', 'leo'];
    const number_of_words = 1 + Math.floor(Math.random() * 5);
    const title_words = [];
    for (let i = 0; i < number_of_words; i++) {
        title_words.push(random_element(words));
    }
    title_words[0] = title_words[0].charAt(0).toUpperCase() + title_words[0].slice(1);
    const title = title_words.join(' ');

    return title;
}

main();
