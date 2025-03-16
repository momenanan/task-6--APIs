const API_KEY = 'd27da90c';
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon'); 
const moviesDiv = document.getElementById('movies');
const searchHistoryDiv = document.getElementById('searchHistory');

document.addEventListener('DOMContentLoaded', () => {
    loadDefaultMovies();
    displaySearchHistory();
});

// تشغيل البحث عند النقر على أيقونة البحث
searchIcon.addEventListener('click', searchMovies);

// تشغيل البحث عند الضغط على Enter
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchMovies();
    }
});

function loadDefaultMovies() {
    fetchMovies('Avengers'); // تحميل أفلام افتراضية عند فتح الصفحة
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
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(query)) {
        history.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
    displaySearchHistory();
}

function displaySearchHistory() {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistoryDiv.innerHTML = '<h3>Search History</h3>';
    if (history.length > 0) {
        history.forEach(item => {
            const historyItem = document.createElement('p');
            historyItem.textContent = item;
            historyItem.addEventListener('click', () => {
                searchInput.value = item;
                fetchMovies(item);
            });
            searchHistoryDiv.appendChild(historyItem);
        });
    } else {
        searchHistoryDiv.innerHTML += '<p>No search history available.</p>';
    }
}
