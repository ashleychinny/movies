const apiKey = '75326fdc'; // Replace with your actual OMDb API key

document.getElementById('searchButton').addEventListener('click', () => {
    const movieTitle = document.getElementById('searchInput').value;
    console.log(`Searching for movie: ${movieTitle}`); // Debugging log
    searchMovie(movieTitle);
});

document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const movieTitle = document.getElementById('searchInput').value;
        console.log(`Searching for movie: ${movieTitle}`); // Debugging log
        searchMovie(movieTitle);
    }
});

function searchMovie(title) {
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;
    console.log(`API URL: ${apiUrl}`); // Debugging log
    fetch(apiUrl)
        .then(response => {
            console.log(`Response status: ${response.status}`); // Debugging log
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data); // Debugging log
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
    movieResults.innerHTML = ''; // Clear previous results
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
                `;
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
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(movieID)) {
        favorites.push(movieID);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Movie saved to favorites!');
        displayFavorites();
    }
}

function removeFromFavorites(movieID) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== movieID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Movie removed from favorites!');
    displayFavorites();
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesContainer = document.getElementById('favorites');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (!favoritesContainer) {
        console.error('favorites element not found');
        return;
    }
    
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        favorites.forEach(movieID => {
            fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieID}`)
                .then(response => response.json())
                .then(movie => {
                    favoritesContainer.innerHTML += `
                        <div class="movie" onclick="openModal('${movie.imdbID}')">
                            <img src="${movie.Poster}" alt="${movie.Title}">
                            <div class="movie-details">
                                <h3>${movie.Title} (${movie.Year})</h3>
                                <p><strong>Genre:</strong> ${movie.Genre}</p>
                                <p><strong>Director:</strong> ${movie.Director}</p>
                                <p><strong>Actors:</strong> ${movie.Actors}</p>
                                <p><strong>Plot:</strong> ${movie.Plot}</p>
                                <button class="unsave-button" onclick="event.stopPropagation(); removeFromFavorites('${movie.imdbID}')">Unsave</button>
                            </div>
                        </div>
                    `;
                });
        });
    }
}

// Display favorites on page load
displayFavorites();