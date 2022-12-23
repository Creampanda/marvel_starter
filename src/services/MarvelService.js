import md5 from "md5";

const getHash = (ts, secretKey, publicKey) => {
  return md5(ts + secretKey + publicKey).toString()
}

class MarvelService {

  _apiBase = 'https://gateway.marvel.com:443/v1/public'
  _apiKey = process.env.REACT_APP_API_KEY;
  _privateKey = process.env.REACT_APP_PRIVATE_KEY;
  _baseOffset = 210;


  getResource = async (baseUrl) => {
    let ts = Date.now().toString();
    let hash = getHash(ts, this._privateKey, this._apiKey);
    let url = `${baseUrl}&ts=${ts}&apikey=${this._apiKey}&hash=${hash}`;
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, status: ${res.status}`)
    }

    return await res.json();
  }

  getAllCharacters = async (offset = this._baseOffset) => {
    const res = await this.getResource(`${this._apiBase}/characters?limit=9&offset=${offset}`);
    return res.data.results.map(this._transformCharacter);
  }

  getCharacter = async (id) => {
    const res = await this.getResource(`${this._apiBase}/characters/${id}?`);
    return this._transformCharacter(res.data.results[0]);
  }
  
  _transformCharacter = (char) => {
    return {
      id: char.id,
      name: char.name,
      description: char.description ? `${char.description.slice(0, 210)}...` : "There is no short description for this hero.",
      thumbnail: char.thumbnail.path + '.' + char.thumbnail.extension,
      homepage: char.urls[0].url,
      wiki: char.urls[1].url,
      comics: char.comics.items.slice(0,11)
    }
  }
}


export default MarvelService;
