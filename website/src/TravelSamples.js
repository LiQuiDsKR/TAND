import React from 'react';
import './TravelSamples.css';

const samples = [
  {
    place: '용산 남산타워',
    theme: '당일치기 여행',
    duration: '1일',
    highlights: ['남산타워', '용산 전쟁기념관'],
    image: 'namsan.jpg'
  },
  {
    place: '부산',
    theme: '먹거리 여행',
    duration: '2박 3일',
    highlights: ['해운대', '자갈치 시장'],
    image: 'busan.jpg'
  },
  {
    place: '제주',
    theme: '우정여행',
    duration: '4박 5일',
    highlights: ['한라산', '성산일출봉'],
    image: 'jeju.jpg'
  }
];

function TravelSamples() {
  return (
    <div className="travel-samples">
      {samples.map((sample, index) => (
        <div key={index} className="travel-card">
          <img src={sample.image} alt={sample.place} className="travel-image" />
          <h3>{sample.place}</h3>
          <p>{sample.theme}</p>
          <p>{sample.duration}</p>
          <p>{sample.highlights.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default TravelSamples;