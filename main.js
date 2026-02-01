import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '54314878-12dceaafde2b2ae0f1dee6a0b';
const input = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loadMoreBtn = document.getElementById('load-more');
const gallery = document.getElementById('showimgs');
const loader = document.getElementById('loader');

let page = 1;
let currentKeyword = '';
const perPage = 40; // Ödev gereği 40 yapıldı

const lightbox = new SimpleLightbox('.gallery-link', {
  captionsData: 'alt',
  captionDelay: 250,
});

async function searchImages(isNewSearch = false) {
  const keyword = input.value.trim();

  if (keyword === '') {
    iziToast.error({ message: 'Please enter a search term' });
    return;
  }

  if (isNewSearch) {
    page = 1;
    gallery.innerHTML = '';
    currentKeyword = keyword;
    loadMoreBtn.classList.add('hidden');
  }

  loader.classList.remove('hidden');

  try {
    // Axios ile istek yapma
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: currentKeyword,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });

    const data = response.data;

    if (data.hits.length === 0) {
      iziToast.error({ message: 'Sorry, there are no images matching your search query. Please try again!' });
      return;
    }

    renderGallery(data.hits);
    lightbox.refresh();

    // Sayfa kaydırma (Smooth Scroll) - İlk yüklemede değil, "Load More" yapıldığında çalışır
    if (page > 1) {
      smoothScroll();
    }

    // Toplam sonuç kontrolü
    const totalPages = Math.ceil(data.totalHits / perPage);
    if (page >= totalPages) {
      loadMoreBtn.classList.add('hidden');
      iziToast.info({ message: "We're sorry, but you've reached the end of search results." });
    } else {
      loadMoreBtn.classList.remove('hidden');
    }

  } catch (error) {
    iziToast.error({ message: 'Something went wrong. Please try again later.' });
    console.error(error);
  } finally {
    loader.classList.add('hidden');
  }
}

function renderGallery(images) {
  const markup = images.map(item => `
    <div class="photo-card">
      <a class="gallery-link" href="${item.largeImageURL}">
        <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b>${item.likes}</p>
        <p class="info-item"><b>Views</b>${item.views}</p>
        <p class="info-item"><b>Comments</b>${item.comments}</p>
        <p class="info-item"><b>Downloads</b>${item.downloads}</p>
      </div>
    </div>
  `).join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function smoothScroll() {
  const card = document.querySelector('.photo-card');
  if (card) {
    const { height: cardHeight } = card.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  searchImages(true);
});

loadMoreBtn.addEventListener('click', () => {
  page += 1;
  searchImages();
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchImages(true);
});