const API_KEY = 'd27da90c';
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const moviesDiv = document.getElementById('movies');
const searchHistoryDiv = document.getElementById('searchHistory');
const showHistoryBtn = document.getElementById('showHistoryBtn');  

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadDefaultMovies();
    displaySearchHistory();
});


searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchMovies();
    }
});

searchIcon.addEventListener('click', () => {
    searchMovies();
});

showHistoryBtn.addEventListener('click', () => {
    searchHistoryDiv.classList.toggle('show');
    displaySearchHistory();
});

function loadDefaultMovies() {
    fetchMovies('Avengers'); 
}

function searchMovies() {
    const query = searchInput.value.trim();
    if (query) {
        saveSearchHistory(query);
        fetchMovies(query);
    }
}

function fetchMovies(query) {
    fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            moviesDiv.innerHTML = '';
            if (data.Search) {
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
                moviesDiv.innerHTML = '<p>No movies found.</p>';
            }
        })
        .catch(error => console.error('Error fetching movies:', error));
}

function openMovieDialog(movieID) {
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
            closeButton.addEventListener('click', () => {
                dialog.remove();
            });
        })
        .catch(error => console.error('Error fetching movie details:', error));
}

function saveSearchHistory(query) {
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

function displaySearchHistory() {
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

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                deleteSearchHistoryItem(index);
            });
        });
    } else {
        searchHistoryDiv.innerHTML = '<p>No search history available.</p>';
    }
}

function deleteSearchHistoryItem(index) {
    searchHistory.splice(index, 1);  
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); 
    displaySearchHistory();  
}
