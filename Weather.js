import React, { useState, memo, setLoading} from 'react';
import './Weather.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapComponent = memo(({ center }) => (
  
    <GoogleMap
      mapContainerStyle={{ width: '400px', height: '300px' }}
      center={center} zoom={10}>
      <Marker position={center} />
    </GoogleMap>
  
));

const Weather = () => {
  // 都市名の配列を管理する状態を定義
  const [cities, setCities] = useState(['']);
  // 各都市の天気データを管理する状態を定義
  const [weatherData, setWeatherData] = useState([]);
  // エラーメッセージを管理する状態を定義
  const [error, setError] = useState('');
  
  const [loading, setLoading] = useState(false);

  // OpenWeatherMapから取得したAPIキー
  const OPENWEATHERMAP_API_KEY = '2147da2b23b910faa9e8fd8cc3071ed9';
  const GOOGLEMAP_API_KEY = 'AIzaSyDI3QAXQR_BDyfAlKBmCqj2Tq-liMwhibs';

  // 新しい都市入力フィールドを追加する関数
  const addCityInput = () => {
    setCities([...cities, '']);
    
  };

// 都市名の変更をハンドリングする関数
const handleCityChange = (index, value) => {
  const newCities = cities.slice();
  newCities[index] = value;
  setCities(newCities);
};

//追加した都市を削除する関数
 const deleteCityInput=(index)=>{
  const newCities=cities.slice();
  newCities.splice(index, 1);
  setCities(newCities);
 };


  // 天気情報を取得する関数
  const getWeather = async (e) => {
    e.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    setError(''); // エラーメッセージをリセット
    setWeatherData([]); // 天気データをリセット
    try {
      // 各都市の天気データを非同期に取得
      const data = await Promise.all(
        cities.map(async (city) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=ja`
          );
          if (!response.ok) {
            throw new Error(`都市 ${city} が見つかりません。`);
          }
          const weatherData = await response.json(); // 天気データをJSON形式で返す
          // 最高・最低気温を抽出してオブジェクトとして返す
        return {
          ...weatherData,
          maxTemp: weatherData.main.temp_max,
          minTemp: weatherData.main.temp_min
        };
        })
      );
      setWeatherData(data); // 取得した天気データを状態に設定
    } catch (error) {
      setError(error.message); // エラーメッセージを状態に設定
    }
  };

  //現在位置の天気情報の取得
  const getLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=ja`
          );
          if (!response.ok) {
            throw new Error('現在位置の天気情報が取得できませんでした。');
          }
          const weatherData = await response.json();
          setWeatherData([{
            ...weatherData,
            maxTemp: weatherData.main.temp_max,
            minTemp: weatherData.main.temp_min
          }]);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }, (error) => {
        setError('現在位置を取得できませんでした。');
        setLoading(false);
      });
    } else {
      setError('Geolocationはこのブラウザでサポートされていません。');
    }
  };


  return (
    <LoadScript googleMapsApiKey='AIzaSyDI3QAXQR_BDyfAlKBmCqj2Tq-liMwhibs'>
    <div>
      <h1>国内天気比較サイト</h1>
      <button onClick={getLocationWeather}>現在位置の天気を取得</button>
      <form onSubmit={getWeather}>
        {cities.map((city, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="都市名を入力"
              value={city}
              onChange={(e) => handleCityChange(index, e.target.value)}/>
            {cities.length > 1 && (
              <button
                type="button"
                className="delete-button"
                onClick={() => deleteCityInput(index)}>
                削除
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCityInput}>都市を追加</button>
        <button type="submit">検索</button>
        
      </form>
      {error && <p>{error}</p>}
      {weatherData.length > 0 && (
        <div>
          <h2>天気比較</h2>
          {weatherData.map((weather, index) => (
            <div className="text-box" key={index}>
              <h3>{weather.name}の天気</h3>
              <p>気温: {weather.main.temp}°C</p>
              <p>天気: {weather.weather[0].description}</p>
              <p>最高: {weather.main.temp_max}°C</p>
              <p>最低: {weather.main.temp_min}°C</p>
              <p>湿度: {weather.main.humidity}%</p>
              <MapComponent center={{ lat: weather.coord.lat, lng: weather.coord.lon }} />
            </div>
          ))}
        </div>
      )}
    </div>
    </LoadScript>
  );
};

export default Weather;
