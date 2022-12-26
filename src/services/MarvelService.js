import md5 from "md5";
import { useHttp } from "../hooks/http.hook";

const getHash = (ts, secretKey, publicKey) => {
  return md5(ts + secretKey + publicKey).toString();
};

const useMarvelService = () => {
  const { loading, request, error, clearError } = useHttp();

  const _apiBase = "https://gateway.marvel.com:443/v1/public";
  const _apiKey = process.env.REACT_APP_API_KEY;
  const _privateKey = process.env.REACT_APP_PRIVATE_KEY;
  const _baseOffset = 210;

  const getResource = async (baseUrl) => {
    let ts = Date.now().toString();
    let hash = getHash(ts, _privateKey, _apiKey);
    let url = `${baseUrl}&ts=${ts}&apikey=${_apiKey}&hash=${hash}`;

    return await request(url);
  };

  const getAllCharacters = async (offset = _baseOffset) => {
    const res = await getResource(
      `${_apiBase}/characters?limit=9&offset=${offset}`
    );
    return res.data.results.map(_transformCharacter);
  };

  const getCharacter = async (id) => {
    const res = await getResource(`${_apiBase}/characters/${id}?`);
    return _transformCharacter(res.data.results[0]);
  };

  const getAllComics = async (offset = 0) => {
    const res = await getResource(
      `${_apiBase}/comics?orderBy=issueNumber&limit=8&offset=${offset}`
    );
    return res.data.results.map(_transformComics);
  };

  const getComics = async (id) => {
    const res = await getResource(`${_apiBase}/comics/${id}?`);
    return _transformComics(res.data.results[0]);
  };

  const _transformCharacter = (char) => {
    return {
      id: char.id,
      name: char.name,
      description: char.description
        ? `${char.description.slice(0, 210)}...`
        : "There is no description for this character",
      thumbnail: char.thumbnail.path + "." + char.thumbnail.extension,
      homepage: char.urls[0].url,
      wiki: char.urls[1].url,
      comics: char.comics.items,
    };
  };

  const _transformComics = (comics) => {
    return {
      id: comics.id,
      title: comics.title,
      description: comics.description || "There is no description",
      pageCount: comics.pageCount
        ? `${comics.pageCount} p.`
        : "No information about the number of pages",
      thumbnail: comics.thumbnail.path + "." + comics.thumbnail.extension,
      language: comics.textObjects.language || "en-us",
      price: comics.prices.price ? `${comics.prices.price}$` : "not available",
    };
  };

  return {
    loading,
    error,
    clearError,
    getAllCharacters,
    getCharacter,
    getAllComics,
    getComics,
  };
};

export default useMarvelService;
