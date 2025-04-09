const apiKey = '75326fdc';

document.getElementById('searchButton').addEventListener('click', () => {
    const movieTitle = document.getElementById('searchInput').value;
    console.log(`Searching for movie: ${movieTitle}`);
    searchMovie(movieTitle);
});

document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const movieTitle = document.getElementById('searchInput').value;
        console.log(`Searching for movie: ${movieTitle}`);
        searchMovie(movieTitle);
    }
});

function searchMovie(title) {
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;
    console.log(`API URL: ${apiUrl}`);
    fetch(apiUrl)
        .then(response => {
            console.log(`Response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
            if (data.Response === 'True') {
                displayMovies(data.Search);
            } else {
                alert('Movies not found!');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayMovies(movies) {
    const movieResults = document.getElementById('movieResults');
    movieResults.innerHTML = ''; 
    movies.forEach(movie => {
        const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    movieResults.innerHTML += `
                        <div class="movie" onclick="openModal('${data.imdbID}')">
                            <img src="${data.Poster}" alt="${data.Title}">
                            <div class="movie-details">
                                <h3>${data.Title} (${data.Year})</h3>
                                <p><strong>Genre:</strong> ${data.Genre}</p>
                                <p><strong>Director:</strong> ${data.Director}</p>
                                <p><strong>Actors:</strong> ${data.Actors}</p>
                                <p><strong>Plot:</strong> ${data.Plot}</p>
                                <button class="save-button" onclick="event.stopPropagation(); saveToFavorites('${data.imdbID}')">Save to Favorites</button>
                            </div>
                        </div>
                    `;
                }
            })
            .catch(error => console.error('Error fetching movie details:', error));
    });
}

function openModal(movieID) {
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movieID}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'True') {
                document.getElementById('modalPoster').src = data.Poster;
                const modalMovieDetails = document.getElementById('modalMovieDetails');
                modalMovieDetails.innerHTML = `
                    <h2>${data.Title} (${data.Year})</h2>
                    <p><strong>Rated:</strong> ${data.Rated}</p>
                    <p><strong>Released:</strong> ${data.Released}</p>
                    <p><strong>Runtime:</strong> ${data.Runtime}</p>
                    <p><strong>Genre:</strong> ${data.Genre}</p>
                    <p><strong>Director:</strong> ${data.Director}</p>
                    <p><strong>Writer:</strong> ${data.Writer}</p>
                    <p><strong>Actors:</strong> ${data.Actors}</p>
                    <p><strong>Plot:</strong> ${data.Plot}</p>
                    <p><strong>Language:</strong> ${data.Language}</p>
                    <p><strong>Country:</strong> ${data.Country}</p>
                    <p><strong>Awards:</strong> ${data.Awards}</p>
                    <p><strong>IMDB Rating:</strong> ${data.imdbRating} <span class="stars">${getStars(data.imdbRating)}</span></p>
                    <p><strong>BoxOffice:</strong> ${data.BoxOffice}</p>
                    <div id="commentSection">
                        <h3>Comments</h3>
                        <div id="comments"></div>
                        <textarea id="commentInput" placeholder="Add a comment..."></textarea>
                        <input type="number" id="ratingInput" min="1" max="10" placeholder="Rating (1-10)">
                        <button onclick="saveComment('${data.imdbID}')">Submit</button>
                    </div>
                `;
                fetch(`/comments/${movieID}`)
                    .then(response => response.json())
                    .then(comments => {
                        const commentsContainer = document.getElementById('comments');
                        commentsContainer.innerHTML = '';
                        comments.forEach(comment => {
                            commentsContainer.innerHTML += `
                                <p><strong>Rating:</strong> ${comment.rating}/10</p>
                                <p>${comment.comment}</p>
                                <hr>
                            `;
                        });
                    });
                document.getElementById('movieModal').style.display = 'block';
            }
        })
        .catch(error => console.error('Error fetching movie details:', error));
}

function getStars(rating) {
    const starCount = Math.round(rating / 2);
    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
}

function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeModal);

window.onclick = function(event) {
    if (event.target == document.getElementById('movieModal')) {
        closeModal();
    }
}

function saveToFavorites(movieID) {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieID}`)
        .then(response => response.json())
        .then(movie => {
            const favoriteData = {
                id: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                genre: movie.Genre,
                director: movie.Director,
                actors: movie.Actors,
                plot: movie.Plot,
                poster: movie.Poster
            };
            fetch('/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(favoriteData)
            })
            .then(response => response.text())
            .then(message => {
                alert(message);
                displayFavorites();
            })
            .catch(error => console.error('Error saving favorite:', error));
        });
}

function removeFromFavorites(movieID) {
    fetch(`/favorites/${movieID}`, {
        method: 'DELETE'
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
        displayFavorites();
    })
    .catch(error => console.error('Error removing favorite:', error));
}

function displayFavorites() {
    fetch('/favorites')
        .then(response => response.json())
        .then(favorites => {
            const favoritesContainer = document.getElementById('favorites');
            const emptyMessage = document.getElementById('emptyMessage');
            
            favoritesContainer.innerHTML = '';
            
            if (favorites.length === 0) {
                emptyMessage.style.display = 'block';
            } else {
                emptyMessage.style.display = 'none';
                favorites.forEach(movie => {
                    favoritesContainer.innerHTML += `
                        <div class="movie" onclick="openModal('${movie.id}')">
                            <img src="${movie.poster}" alt="${movie.title}">
                            <div class="movie-details">
                                <h3>${movie.title} (${movie.year})</h3>
                                <p><strong>Genre:</strong> ${movie.genre}</p>
                                <p><strong>Director:</strong> ${movie.director}</p>
                                <p><strong>Actors:</strong> ${movie.actors}</p>
                                <p><strong>Plot:</strong> ${movie.plot}</p>
                                <button class="unsave-button" onclick="event.stopPropagation(); removeFromFavorites('${movie.id}')">Unsave</button>
                            </div>
                        </div>
                    `;
                });
            }
        })
        .catch(error => console.error('Error fetching favorites:', error));
}

function saveComment(movieID) {
    const comment = document.getElementById('commentInput').value;
    const rating = document.getElementById('ratingInput').value;
    fetch('/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movie_id: movieID, comment, rating })
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
        openModal(movieID); // Refresh comments
    })
    .catch(error => console.error('Error saving comment:', error));
}

displayFavorites();
