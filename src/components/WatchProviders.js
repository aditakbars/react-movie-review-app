import React from 'react';
import '../App.css';
import RegionSwitch from './RegionSwitch';
import { REGIONS } from '../region';

const WatchProviders = ({ providers, region = 'ID' }) => {
    const here = providers?.[region];
    const groups = [['Stream', here?.flatrate], ['Rent', here?.rent], ['Buy', here?.buy]].filter(([, p]) => p?.length);
    const elsewhere = Object.keys(REGIONS).find((r) => r !== region && providers?.[r]);

    return (
        <div className="showing">
            <h2>Showing at home</h2>
            <RegionSwitch label="Services in" />
            {groups.length > 0 ? (
                <dl>
                    {groups.map(([label, list]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>
                                {list.map((p) => (
                                    <span key={p.provider_id} className="showing__provider">
                                        <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt="" width="26" height="26" />
                                        {p.provider_name}
                                    </span>
                                ))}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="showing__none">
                    Not listed on any streaming service in {REGIONS[region].short} yet.
                    {elsewhere && ` It is in ${REGIONS[elsewhere].short}.`}
                </p>
            )}
        </div>
    );
};

export default WatchProviders;
