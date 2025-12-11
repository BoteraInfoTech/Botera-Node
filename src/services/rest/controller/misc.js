import fetch from 'node-fetch';
import Busboy from 'busboy';
import { v2 as cloudinary } from 'cloudinary';

export const getGifList = async (req, res) => {
  const { category, q, currentPage = 1 } = req.query;
  const limit = 50;
  const apiKey = process.env.GIPHY_API_KEY; // store in env ALWAYS
  const baseUrl = 'https://api.giphy.com/v1/gifs/search';

  const apiPayload = {
    api_key: apiKey,
    limit,
    offset: (Number(currentPage) - 1) * limit,
    rating: 'g',
    lang: 'en',
    bundle: 'messaging_non_clips',
  };

  if (q) {
    Object.assign(apiPayload, {
      q,
    });
  } else {
    const validCategory = ['memes', 'stickers', 'trending', 'reactions'];

    let categoryTrim =
      category && typeof category === 'string'
        ? category.trim().toLocaleLowerCase()
        : 'trending';

    if (!validCategory.includes(categoryTrim)) {
      categoryTrim = 'trending';
    }
    Object.assign(apiPayload, {
      q: categoryTrim,
    });
  }
  try {
    const params = new URLSearchParams(apiPayload);
    const response = await fetch(`${baseUrl}?${params}`);
    const responseData = await response.json();
    const finalResult = responseData.data;
    const result = finalResult.map((gif) => {
      if (
        gif &&
        gif.images &&
        gif.images.original &&
        gif.images.original.url &&
        gif.images.fixed_width_downsampled &&
        gif.images.fixed_width_downsampled.url
      ) {
        return {
          id: gif.id,
          original: gif.images.original.url,
          preview: gif.images.fixed_width_downsampled.url,
        };
      }
    });

    const haveMorePages =
      responseData &&
      responseData.pagination &&
      responseData.pagination.total_count > Number(currentPage) * limit;

    res.send({
      message: "Gif's Fetch SuccessFully",
      response: {
        gifUrls: result,
        haveMorePages,
      },
    });
  } catch (error) {
    console.error('Giphy Search Error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch Giphy results' });
  }
};

export const getUnsplashImages = async (req, res) => {
  const { category, q, currentPage = 1 } = req.query;
  const limit = 50;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const baseUrl = 'https://api.unsplash.com/search/photos';

  let searchQuery = '';

  if (q) {
    searchQuery = q;
  } else {
    const validCategory = ['trending', 'people', 'street', 'film'];
    let categoryTrim =
      category && typeof category === 'string'
        ? category.trim().toLowerCase()
        : 'trending';

    if (!validCategory.includes(categoryTrim)) {
      categoryTrim = 'trending';
    }
    searchQuery = categoryTrim;
  }

  try {
    const params = new URLSearchParams({
      query: searchQuery,
      per_page: limit,
      page: currentPage,
      client_id: accessKey,
    });

    const response = await fetch(`${baseUrl}?${params}`);
    const responseData = await response.json();

    const results = responseData.results || [];

    const imageUrls = results.map((item) => ({
      id: item.id,
      original: item.urls?.full || '',
      preview: item.urls?.small || '',
    }));

    const total = responseData.total || 0;
    const haveMorePages = total > Number(currentPage) * limit;

    res.send({
      message: 'Unsplash Images Fetched Successfully',
      response: {
        imageUrls,
        haveMorePages,
        responseData,
      },
    });
  } catch (error) {
    console.error('Unsplash Search Error:', error.message);
    return res
      .status(500)
      .json({ message: 'Failed to fetch Unsplash results' });
  }
};

export const getPixabayImages = async (req, res) => {
  const { category, q, currentPage = 1 } = req.query;
  const limit = 50;
  const apiKey = process.env.PIXABAY_API_KEY; // store safely in env
  const baseUrl = 'https://pixabay.com/api/';

  let searchQuery = '';

  if (q) {
    searchQuery = q;
  } else {
    const validCategory = ['trending', 'nature', 'festival', 'animal', 'anime'];

    let categoryTrim =
      category && typeof category === 'string'
        ? category.trim().toLowerCase()
        : 'trending';

    if (!validCategory.includes(categoryTrim)) {
      categoryTrim = 'trending';
    }

    searchQuery = categoryTrim;
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: searchQuery,
      page: currentPage,
      per_page: limit,
      image_type: 'photo',
      safesearch: 'true',
    });

    const response = await fetch(`${baseUrl}?${params}`);
    const responseData = await response.json();

    const hits = responseData.hits || [];

    const imageUrls = hits.map((img) => ({
      id: img.id,
      original: img.largeImageURL || '',
      preview: img.previewURL || '',
    }));

    const total = responseData.totalHits || 0;
    const haveMorePages = total > Number(currentPage) * limit;

    res.send({
      message: 'Pixabay Images Fetched Successfully',
      response: {
        imageUrls,
        haveMorePages,
      },
    });
  } catch (error) {
    console.error('Pixabay Search Error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch Pixabay results' });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    const busboy = Busboy({ headers: req.headers });
    let uploadPromise;

    busboy.on('file', (fileName,file) => {
      let resourceType = 'auto';
      uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'your_app_uploads',
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        file.pipe(uploadStream);
      });
    });

    busboy.on('finish', async () => {
      try {
        const result = await uploadPromise;

        return res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          type: result.resource_type,
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Upload failed',
          error: err.message,
        });
      }
    });
    req.pipe(busboy);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};
