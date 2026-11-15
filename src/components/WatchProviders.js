import React from 'react';
import '../App.css';

const WatchProviders = ({ providers }) => {
    const us = providers?.['US'];
    if (!us || (!us.flatrate && !us.rent && !us.buy)) return null;
    const groups = [['Stream', us.flatrate], ['Rent', us.rent], ['Buy', us.buy]].filter(([, p]) => p?.length);

    return (
        <div className="showing">
            <h2>Showing at home, US</h2>
            <dl>
                {groups.map(([label, list]) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                            {list.map((p) => (
                                <span key={p.provider_id} className="showing__provider">
                                    <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt="" />
                                    {p.provider_name}
                                </span>
                            ))}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

export default WatchProviders;
