import React from 'react';
import '../App.css';

const IMG_BASE = 'https://image.tmdb.org/t/p/w45';

const ProviderGroup = ({ label, providers }) => {
    if (!providers?.length) return null;
    return (
        <div className='provider-group'>
            <span className='provider-label'>{label}</span>
            <div className='provider-logos'>
                {providers.map(p => (
                    <img
                        key={p.provider_id}
                        className='provider-logo'
                        src={`${IMG_BASE}${p.logo_path}`}
                        alt={p.provider_name}
                        title={p.provider_name}
                    />
                ))}
            </div>
        </div>
    );
};

const WatchProviders = ({ providers }) => {
    const us = providers?.['US'];
    if (!us || (!us.flatrate && !us.rent && !us.buy)) return null;

    return (
        <div className='watch-providers-section'>
            <div className='section-heading'><h2>Where to Watch</h2></div>
            <div className='watch-providers-card'>
                <ProviderGroup label='Stream' providers={us.flatrate} />
                <ProviderGroup label='Rent' providers={us.rent} />
                <ProviderGroup label='Buy' providers={us.buy} />
                <p className='provider-attribution'>
                    Watch data by{' '}
                    <a href='https://www.justwatch.com' target='_blank' rel='noreferrer'>JustWatch</a>
                    {' '}· US availability
                </p>
            </div>
        </div>
    );
};

export default WatchProviders;
