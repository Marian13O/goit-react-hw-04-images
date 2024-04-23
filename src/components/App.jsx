import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Loader from './Loader/Loader';
import Button from './Button/Button';

const App = () => {
  const [URL] = useState('https://pixabay.com/api/');
  const [API_KEY] = useState('25766392-01b12b6ed5ab34bc2910d9c3e');
  const [pictures, setPictures] = useState([]);
  const [, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalHits, setTotalHits] = useState(null);

  const fetchImages = useCallback(() => {
    const fetchUrl = `${URL}?q=${query}&page=${page}&key=${API_KEY}&image_type=photo&orientation=horizontal&per_page=12`;

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to find any images');
        }
        return response.json();
      })
      .then(data => {
        if (data && data.total === 0) {
          toast.error('No images found.');
        }
        const selectedProperties = data.hits.map(
          ({ id, largeImageURL, webformatURL }) => ({
            id,
            largeImageURL,
            webformatURL,
          })
        );
        setPictures(prevPictures => [...prevPictures, ...selectedProperties]);
        setStatus('resolved');
        setTotalHits(data ? data.total : 0);
      })
      .catch(error => {
        setError(error);
        setStatus('rejected');
      });
  }, [URL, API_KEY, query, page]);

  useEffect(() => {
    if (query.trim() === '') return;
    setStatus('pending');
    setPictures([]);
    setPage(1);
    fetchImages();
  }, [query, fetchImages]);

  useEffect(() => {
    if (query.trim() === '') return;
    if (page > 1) {
      setStatus('pending');
      fetchImages();
    }
  }, [page, fetchImages, query]);

  const handleSearchSubmit = useCallback(newQuery => {
    setQuery(newQuery);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage(prevPage => prevPage + 1);
  }, []);

  return (
    <>
      <Searchbar onSubmit={handleSearchSubmit} />
      {pictures.length > 0 && <ImageGallery images={pictures} />}
      {totalHits && totalHits > pictures.length && (
        <Button onClick={handleLoadMore} />
      )}
      {status === 'pending' && <Loader />}
      <ToastContainer autoClose={2000} />
    </>
  );
};

export default App;
