const API_KEY = 'd27da90c';
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const moviesDiv = document.getElementById('movies');
const searchHistoryDiv = document.getElementById('searchHistory');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const errorMessage = document.getElementById('errorMessage');

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadDefaultMovies();
    displaySearchHistory();
});

searchIcon.addEventListener('click', () => searchMovies());

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') searchMovies();
});

showHistoryBtn.addEventListener('click', () => {
    searchHistoryDiv.classList.toggle('show');
    displaySearchHistory();
});

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => errorMessage.classList.add('hidden'), 3000); 
};

const loadDefaultMovies = () => fetchMovies('Avengers');

const searchMovies = () => {
    const query = searchInput.value.trim();
    if (!query) {
        showError("Please enter a movie name.");
        return;
    }
    saveSearchHistory(query);
    fetchMovies(query);
};

const fetchMovies = (query) => {
    fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            moviesDiv.innerHTML = '';
            if (data.Response === "True") {
                data.Search.forEach(movie => {
                    const movieElement = document.createElement('div');
                    movieElement.classList.add('movie');
                    movieElement.innerHTML = `
                        <img src="${movie.Poster}" alt="${movie.Title}">
                        <span>${movie.Title} (${movie.Year})</span>
                    `;
                    movieElement.addEventListener('click', () => openMovieDialog(movie.imdbID));
                    moviesDiv.appendChild(movieElement);
                });
            } else {
                showError("No movies found. Try a different search.");
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            showError("An error occurred while fetching movies.");
        });
};

const openMovieDialog = (movieID) => {
    const existingDialog = document.querySelector('.dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    fetch(`https://www.omdbapi.com/?i=${movieID}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(movie => {
            const dialog = document.createElement('div');
            dialog.classList.add('dialog');
            dialog.innerHTML = `
                <div class="dialog-content">
                    <span class="close-btn">&times;</span>
                    <h2>${movie.Title} (${movie.Year})</h2>
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Plot:</strong> ${movie.Plot}</p>
                </div>
            `;
            document.body.appendChild(dialog);
            
            const closeButton = dialog.querySelector('.close-btn');
            closeButton.addEventListener('click', () => dialog.remove());
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            showError("Failed to fetch movie details.");
        });
};

const saveSearchHistory = (query) => {
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
};

const displaySearchHistory = () => {
    searchHistoryDiv.innerHTML = '';
    if (searchHistory.length > 0) {
        searchHistory.forEach((query, index) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                <span>${query}</span>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            searchHistoryDiv.appendChild(historyItem);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                deleteSearchHistoryItem(index);
            });
        });
    } else {
        searchHistoryDiv.innerHTML = '<p>No search history available.</p>';
    }
};

const deleteSearchHistoryItem = (index) => {
    searchHistory.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
};
