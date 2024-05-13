import React, { useState, useEffect } from 'react';

interface Waifu {
  id: number;
  url: string;
}

const App: React.FC = () => {
  const [waifuImages, setWaifuImages] = useState<Waifu[]>([]);
  const [category, setCategory] = useState<string>('sfw'); // Default: sfw
  const [amount, setAmount] = useState<number>(10); // Jumlah gambar awal yang ditampilkan
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sfwCache, setSfwCache] = useState<Waifu[]>([]);
  const [nsfwCache, setNsfwCache] = useState<Waifu[]>([]);

  useEffect(() => {
    fetchWaifuImages();
  }, [category, amount]); // Memanggil fetchWaifuImages() ketika category atau amount berubah

  const fetchWaifuImages = async () => {
    try {
      setIsLoading(true);
      let cachedData: Waifu[] = [];
      if (category === 'sfw' && sfwCache.length > 0) {
        cachedData = sfwCache;
      } else if (category === 'nsfw' && nsfwCache.length > 0) {
        cachedData = nsfwCache;
      } else {
        const response = await fetch(`https://api.waifu.pics/many/${category}/waifu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ category: 'waifu', amount })
        });

        const data = await response.json();
        cachedData = data.files.map((url: string, index: number) => ({ id: index, url }));
        if (category === 'sfw') {
          setSfwCache(cachedData);
        } else {
          setNsfwCache(cachedData);
        }
      }

      setWaifuImages(cachedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching waifu images:', error);
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setAmount(10); // Reset jumlah gambar yang ditampilkan saat mengganti kategori
  };

  const handleLoadMore = () => {
    setAmount(prevAmount => prevAmount + 10); // Menambah jumlah gambar yang ditampilkan dengan 10
  };

  const handleViewDetails = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Random Waifu Gallery</h1>
      <div className="flex justify-center mb-4">
        <button
          className={`mr-4 px-4 py-2 rounded ${
            category === 'sfw' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => handleCategoryChange('sfw')}
        >
          SFW
        </button>
        <button
          className={`px-4 py-2 rounded ${
            category === 'nsfw' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => handleCategoryChange('nsfw')}
        >
          NSFW
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {waifuImages.length > 0 ? (
          waifuImages.slice(0, amount).map((waifu: Waifu) => (
            <div key={waifu.id} className="relative overflow-hidden rounded-lg shadow-md transition duration-300 transform hover:scale-105">
              <img
                src={`${waifu.url}?w=300`}
                alt={`Waifu ${waifu.id + 1}`}
                className="w-full h-auto cursor-pointer"
                onClick={() => handleViewDetails(waifu.url)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                <button className="px-4 py-2 bg-white text-gray-800 rounded-lg shadow-md hover:bg-gray-100">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : isLoading ? (
          <p>Loading...</p>
        ) : (
          <p>No images found.</p>
        )}
      </div>
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-8 max-w-lg overflow-y-auto">
            <img src={selectedImage} alt="Selected Waifu" className="w-full h-auto" />
            <button className="absolute top-4 right-4 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
      {waifuImages.length > amount && ( // Tampilkan tombol "Load More" jika jumlah gambar melebihi yang ditampilkan
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleLoadMore}
            disabled={isLoading} // Menonaktifkan tombol saat sedang loading
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
