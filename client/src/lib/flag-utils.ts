import React from 'react';

const FLAG_IMAGES: Record<string, string> = {
  'Portugal': 'https://flagcdn.com/24x18/pt.png',
  'Belgium': 'https://flagcdn.com/24x18/be.png',
  'Germany': 'https://flagcdn.com/24x18/de.png',
  'France': 'https://flagcdn.com/24x18/fr.png',
  'Japan': 'https://flagcdn.com/24x18/jp.png',
  'United States': 'https://flagcdn.com/24x18/us.png',
  'Canada': 'https://flagcdn.com/24x18/ca.png',
  'United Kingdom': 'https://flagcdn.com/24x18/gb.png',
  'UK': 'https://flagcdn.com/24x18/gb.png',
  'Spain': 'https://flagcdn.com/24x18/es.png',
  'Italy': 'https://flagcdn.com/24x18/it.png',
  'Netherlands': 'https://flagcdn.com/24x18/nl.png',
  'Switzerland': 'https://flagcdn.com/24x18/ch.png',
  'Austria': 'https://flagcdn.com/24x18/at.png',
  'Greece': 'https://flagcdn.com/24x18/gr.png',
  'Poland': 'https://flagcdn.com/24x18/pl.png',
  'Czech Republic': 'https://flagcdn.com/24x18/cz.png',
  'Czechia': 'https://flagcdn.com/24x18/cz.png',
  'Hungary': 'https://flagcdn.com/24x18/hu.png',
  'Sweden': 'https://flagcdn.com/24x18/se.png',
  'Norway': 'https://flagcdn.com/24x18/no.png',
  'Denmark': 'https://flagcdn.com/24x18/dk.png',
  'Finland': 'https://flagcdn.com/24x18/fi.png',
  'Ireland': 'https://flagcdn.com/24x18/ie.png',
  'Iceland': 'https://flagcdn.com/24x18/is.png',
  'Croatia': 'https://flagcdn.com/24x18/hr.png',
  'Slovenia': 'https://flagcdn.com/24x18/si.png',
  'Slovakia': 'https://flagcdn.com/24x18/sk.png',
  'Romania': 'https://flagcdn.com/24x18/ro.png',
  'Bulgaria': 'https://flagcdn.com/24x18/bg.png',
  'China': 'https://flagcdn.com/24x18/cn.png',
  'South Korea': 'https://flagcdn.com/24x18/kr.png',
  'Korea': 'https://flagcdn.com/24x18/kr.png',
  'Thailand': 'https://flagcdn.com/24x18/th.png',
  'Vietnam': 'https://flagcdn.com/24x18/vn.png',
  'Singapore': 'https://flagcdn.com/24x18/sg.png',
  'Malaysia': 'https://flagcdn.com/24x18/my.png',
  'Indonesia': 'https://flagcdn.com/24x18/id.png',
  'Philippines': 'https://flagcdn.com/24x18/ph.png',
  'India': 'https://flagcdn.com/24x18/in.png',
  'Taiwan': 'https://flagcdn.com/24x18/tw.png',
  'Hong Kong': 'https://flagcdn.com/24x18/hk.png',
  'Australia': 'https://flagcdn.com/24x18/au.png',
  'New Zealand': 'https://flagcdn.com/24x18/nz.png',
  'Brazil': 'https://flagcdn.com/24x18/br.png',
  'Argentina': 'https://flagcdn.com/24x18/ar.png',
  'Chile': 'https://flagcdn.com/24x18/cl.png',
  'Mexico': 'https://flagcdn.com/24x18/mx.png',
  'Costa Rica': 'https://flagcdn.com/24x18/cr.png',
  'Panama': 'https://flagcdn.com/24x18/pa.png',
  'Guatemala': 'https://flagcdn.com/24x18/gt.png',
  'Jamaica': 'https://flagcdn.com/24x18/jm.png',
  'Bahamas': 'https://flagcdn.com/24x18/bs.png',
  'Barbados': 'https://flagcdn.com/24x18/bb.png',
  'Russia': 'https://flagcdn.com/24x18/ru.png',
  'Turkey': 'https://flagcdn.com/24x18/tr.png',
  'Israel': 'https://flagcdn.com/24x18/il.png',
  'Egypt': 'https://flagcdn.com/24x18/eg.png',
  'Morocco': 'https://flagcdn.com/24x18/ma.png',
  'South Africa': 'https://flagcdn.com/24x18/za.png',
  'Kenya': 'https://flagcdn.com/24x18/ke.png',
  'Nigeria': 'https://flagcdn.com/24x18/ng.png'
};

export function getCountryFlag(countryName: string): string {
  if (!countryName) return '';
  
  // Try exact match first
  if (FLAG_IMAGES[countryName]) return FLAG_IMAGES[countryName];
  
  // Try case-insensitive exact match
  const lowerName = countryName.toLowerCase();
  for (const [country, flagUrl] of Object.entries(FLAG_IMAGES)) {
    if (country.toLowerCase() === lowerName) return flagUrl;
  }
  
  // Try partial matches
  for (const [country, flagUrl] of Object.entries(FLAG_IMAGES)) {
    if (country.toLowerCase().includes(lowerName) || lowerName.includes(country.toLowerCase())) {
      return flagUrl;
    }
  }
  
  return '';
}

export function getFlagImageComponent(countryName: string): React.ReactElement | null {
  const flagUrl = getCountryFlag(countryName);
  
  if (!flagUrl) {
    return React.createElement('span', {
      className: 'inline-block w-6 h-4 bg-gray-200 rounded-sm'
    });
  }
  
  return React.createElement('img', {
    src: flagUrl,
    alt: `${countryName} flag`,
    className: 'inline-block w-6 h-4 object-cover rounded-sm border border-gray-200',
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.style.display = 'none';
    }
  });
}
